#!/usr/bin/env bash
#
# install.sh - Cross-platform installation script for mdsel-skill
#
# Detects Claude Code and OpenCode installations, configures skill and hooks.
# Can be run directly or via npm postinstall.

set -euo pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

# Script directory for relative path resolution
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Installation targets (will be detected)
CLAUDE_CONFIG_DIR=""
OPENCODE_CONFIG_DIR=""

# mdsel CLI availability
MDSEL_AVAILABLE=false

# ============================================================================
# PLATFORM DETECTION
# ============================================================================

detect_os() {
    # PATTERN: Use uname for OS detection
    # RETURNS: "linux" or "darwin" (macOS)
    case "$(uname -s)" in
        Linux*)  echo "linux" ;;
        Darwin*) echo "darwin" ;;
        *)       echo "unknown" ;;
    esac
}

detect_claude_code() {
    # PATTERN: Check for Claude Code configuration directories
    # ORDER: Prefer user-level (~/.claude/) over project-level (.claude/)
    # RETURNS: 0 if detected, 1 if not

    if [[ -d "$HOME/.claude" ]]; then
        CLAUDE_CONFIG_DIR="$HOME/.claude"
        return 0
    elif [[ -d ".claude" ]]; then
        CLAUDE_CONFIG_DIR=".claude"
        return 0
    fi
    return 1
}

detect_opencode() {
    # PATTERN: Check for OpenCode configuration directories
    # ORDER: Prefer user-level (~/.config/opencode/) over workspace (.opencode/)
    # RETURNS: 0 if detected, 1 if not

    if [[ -d "$HOME/.config/opencode" ]]; then
        OPENCODE_CONFIG_DIR="$HOME/.config/opencode"
        return 0
    elif [[ -d ".opencode" ]]; then
        OPENCODE_CONFIG_DIR=".opencode"
        return 0
    fi
    return 1
}

# ============================================================================
# MDSel CLI VERIFICATION
# ============================================================================

verify_mdsel_cli() {
    # PATTERN: Check command existence with command -v
    # FALLBACK: npx mdsel always works if npm is available
    # GOTCHA: Don't fail installation if mdsel unavailable (skill can still be installed)

    if command -v mdsel >/dev/null 2>&1; then
        echo "  mdsel CLI found in PATH"
        export MDSEL_AVAILABLE=true
        return 0
    fi

    # Try npx fallback
    if command -v npx >/dev/null 2>&1; then
        if npx mdsel --version >/dev/null 2>&1; then
            echo "  mdsel CLI available via npx"
            export MDSEL_AVAILABLE=true
            return 0
        fi
    fi

    echo "  mdsel CLI not found. Install with: npm install -g mdsel"
    echo "  The skill will still work, but mdsel commands will require npx."
    return 0  # Don't fail installation
}

# ============================================================================
# SKILL INSTALLATION
# ============================================================================

install_skill() {
    # PATTERN: Create directory structure and copy files
    # SOURCE: $SCRIPT_DIR/.claude/skills/mdsel/SKILL.md
    # TARGET: ~/.claude/skills/mdsel/SKILL.md (works for both platforms)

    local skill_source="$SCRIPT_DIR/.claude/skills/mdsel/SKILL.md"
    local skill_target="$HOME/.claude/skills/mdsel/SKILL.md"

    echo "  Installing mdsel skill..."

    # Create target directory
    mkdir -p "$HOME/.claude/skills/mdsel"

    # Copy skill file
    if [[ -f "$skill_source" ]]; then
        cp "$skill_source" "$skill_target"
        echo "  Skill installed to: $skill_target"
    else
        echo "  ERROR: Skill source file not found: $skill_source"
        return 1
    fi
}

# ============================================================================
# CLAUDE CODE HOOK CONFIGURATION
# ============================================================================

install_claude_hook() {
    # PATTERN: Copy script and merge settings.json
    # CRITICAL: Preserve existing hooks in settings.json
    # GOTCHA: jq may not be available - handle gracefully

    local hook_source="$SCRIPT_DIR/hooks/claude/mdsel-reminder.sh"
    local hook_target="$HOME/.claude/hooks/mdsel-reminder.sh"
    local settings_file="$HOME/.claude/settings.json"

    echo "  Installing Claude Code hook..."

    # Create hooks directory
    mkdir -p "$HOME/.claude/hooks"

    # Copy hook script
    if [[ -f "$hook_source" ]]; then
        cp "$hook_source" "$hook_target"
        chmod 755 "$hook_target"
        echo "  Hook script installed to: $hook_target"
    else
        echo "  ERROR: Hook source file not found: $hook_source"
        return 1
    fi

    # Configure settings.json
    configure_claude_settings "$settings_file"
}

configure_claude_settings() {
    # PATTERN: Merge PostToolUse hook into existing settings.json
    # CRITICAL: Preserve existing hooks, don't overwrite entire file
    # GOTCHA: If jq unavailable, use manual JSON manipulation

    local settings_file="$1"

    # Create settings.json if it doesn't exist
    if [[ ! -f "$settings_file" ]]; then
        echo '{"hooks":{"PostToolUse":[]}}' > "$settings_file"
    fi

    # Use jq if available for safe JSON manipulation
    if command -v jq >/dev/null 2>&1; then
        # CRITICAL: Check if hook already exists to avoid duplicates
        local hook_exists
        hook_exists=$(jq -r '.hooks.PostToolUse[]? | select(.hook.command | contains("mdsel-reminder"))' "$settings_file" 2>/dev/null || echo "")

        if [[ -z "$hook_exists" ]]; then
            # Add the PostToolUse hook
            local tmp_file
            tmp_file=$(mktemp)
            jq '
                .hooks.PostToolUse += [{
                    "matcher": {"toolName": "Read"},
                    "hook": {
                        "type": "command",
                        "command": "bash ~/.claude/hooks/mdsel-reminder.sh"
                    }
                }]
            ' "$settings_file" > "$tmp_file" && mv "$tmp_file" "$settings_file"
            echo "  Hook configured in settings.json"
        else
            echo "  Hook already configured in settings.json"
        fi
    else
        echo "  WARNING: jq not found. Please manually add the following to $settings_file:"
        echo '  {"hooks":{"PostToolUse":[{"matcher":{"toolName":"Read"},"hook":{"type":"command","command":"bash ~/.claude/hooks/mdsel-reminder.sh"}}]}}'
    fi
}

# ============================================================================
# OPENCODE PLUGIN INSTALLATION
# ============================================================================

install_opencode_plugin() {
    # PATTERN: Build TypeScript plugin and copy to target directory
    # CRITICAL: Must run npm install and build before copying
    # GOTCHA: Plugin directory structure may vary by OpenCode version

    local plugin_source_dir="$SCRIPT_DIR/hooks/opencode"
    local plugin_target_dir="$HOME/.config/opencode/plugins/mdsel-reminder"

    echo "  Installing OpenCode plugin..."

    # Check if OpenCode config directory exists
    if [[ -z "$OPENCODE_CONFIG_DIR" ]]; then
        echo "  OpenCode not detected, skipping plugin installation"
        return 0
    fi

    # Install dependencies and build plugin
    if [[ -d "$plugin_source_dir" ]]; then
        echo "  Building TypeScript plugin..."
        (cd "$plugin_source_dir" && npm install >/dev/null 2>&1 && npm run build >/dev/null 2>&1)

        # Create target directory
        mkdir -p "$plugin_target_dir"

        # Copy compiled files (they'll be in dist/ based on tsconfig.json)
        if [[ -d "$plugin_source_dir/dist" ]]; then
            cp "$plugin_source_dir"/dist/*.{js,map,d.ts} "$plugin_target_dir/" 2>/dev/null || true
        fi

        # Copy package.json for dependency resolution
        cp "$plugin_source_dir"/package.json "$plugin_target_dir/" 2>/dev/null || true

        # If build didn't work, copy the .ts file directly
        if [[ ! -d "$plugin_source_dir/dist" ]]; then
            cp "$plugin_source_dir"/mdsel-reminder.ts "$plugin_target_dir/" 2>/dev/null || true
        fi

        echo "  Plugin installed to: $plugin_target_dir"
    else
        echo "  ERROR: Plugin source directory not found: $plugin_source_dir"
        return 1
    fi
}

# ============================================================================
# INSTALLATION VERIFICATION
# ============================================================================

verify_installation() {
    # PATTERN: Check each installation target and report status
    # OUTPUT: Clear human-readable status for each component

    echo ""
    echo "Installation Status:"
    echo "===================="

    # Check skill installation
    if [[ -f "$HOME/.claude/skills/mdsel/SKILL.md" ]]; then
        echo "  Skill file: $HOME/.claude/skills/mdsel/SKILL.md"
    else
        echo "  Skill file: NOT FOUND"
    fi

    # Check Claude Code hook (if Claude Code detected)
    if [[ -n "$CLAUDE_CONFIG_DIR" ]]; then
        if [[ -f "$HOME/.claude/hooks/mdsel-reminder.sh" ]]; then
            echo "  Claude Code hook: $HOME/.claude/hooks/mdsel-reminder.sh"
        else
            echo "  Claude Code hook: NOT FOUND"
        fi
    fi

    # Check OpenCode plugin (if OpenCode detected)
    if [[ -n "$OPENCODE_CONFIG_DIR" ]]; then
        if [[ -d "$HOME/.config/opencode/plugins/mdsel-reminder" ]]; then
            echo "  OpenCode plugin: $HOME/.config/opencode/plugins/mdsel-reminder"
        else
            echo "  OpenCode plugin: NOT FOUND"
        fi
    fi

    echo ""
}

# ============================================================================
# MAIN FUNCTION
# ============================================================================

main() {
    echo "mdsel-skill Installation"
    echo "========================"
    echo ""

    # Detect platforms
    local os
    os=$(detect_os)
    echo "Detected OS: $os"
    echo ""

    if detect_claude_code; then
        echo "Claude Code detected at: $CLAUDE_CONFIG_DIR"
    else
        echo "Claude Code: not detected"
    fi

    if detect_opencode; then
        echo "OpenCode detected at: $OPENCODE_CONFIG_DIR"
    else
        echo "OpenCode: not detected"
    fi

    echo ""

    # Verify mdsel CLI
    echo "Checking mdsel CLI..."
    verify_mdsel_cli
    echo ""

    # Install components
    install_skill

    if [[ -n "$CLAUDE_CONFIG_DIR" ]]; then
        install_claude_hook
    fi

    if [[ -n "$OPENCODE_CONFIG_DIR" ]]; then
        install_opencode_plugin
    fi

    # Verify installation
    verify_installation

    echo "Installation complete!"
    echo ""
    echo "Note: You may need to restart your AI coding session for changes to take effect."
}

# Execute main function
main "$@"
