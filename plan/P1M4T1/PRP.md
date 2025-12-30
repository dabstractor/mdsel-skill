# Product Requirement Prompt (PRP): Cross-Platform Installation Script

---

## Goal

**Feature Goal**: Create a cross-platform Bash installation script (`install.sh`) that automatically detects Claude Code and/or OpenCode installations, configures the mdsel skill and reminder hooks appropriately, and verifies successful setup.

**Deliverable**: An executable shell script `install.sh` in the project root that performs:
- Platform detection (Linux/macOS)
- mdsel CLI verification
- Claude Code detection and skill installation
- OpenCode detection and plugin installation
- Hook configuration for both platforms
- Installation verification with clear status output

**Success Definition**: Running `./install.sh` or `curl -fsSL https://... | bash` successfully installs mdsel-skill on any supported platform with clear status messages indicating what was installed and any errors encountered.

## User Persona

**Target User**: Developer using Claude Code and/or OpenCode who wants to install mdsel-skill to improve token efficiency when working with large Markdown files.

**Use Case**: Developer has just installed mdsel-skill via `npm install -g mdsel-skill` or downloaded the source and needs to configure the skill and hooks for their AI coding environment.

**User Journey**:
1. User runs `npm install -g mdsel-skill` which triggers the postinstall script
2. Installation script auto-detects which platforms (Claude Code, OpenCode) are present
3. Script installs skill file to `.claude/skills/mdsel/SKILL.md`
4. Script configures hooks for detected platforms
5. User sees clear output showing what was installed
6. User can immediately use mdsel in their AI coding sessions

**Pain Points Addressed**:
- Manual file copying and configuration is error-prone
- Users may not know where Claude Code/OpenCode store configurations
- Hook configuration (settings.json merging) is complex and fragile
- No clear feedback if installation succeeded or failed

## Why

- **Token Efficiency**: Proper installation enables ~95-99% token reduction when working with large Markdown files
- **Cross-Platform Support**: Single installation method works for both Claude Code and OpenCode users
- **Automation**: Eliminates manual configuration steps that lead to support issues
- **User Experience**: Clear status output reduces confusion and support burden
- **Distribution**: Enables npm-based distribution with automatic postinstall setup

## What

### Shell Script Specification

The `install.sh` script must:

1. **Platform Detection**: Detect OS (Linux/macOS), shell (bash/zsh), and installed AI coding platforms
2. **mdsel CLI Verification**: Check if `mdsel` command exists in PATH or is available via `npx`
3. **Skill Installation**: Create `.claude/skills/mdsel/` directory and copy `SKILL.md`
4. **Claude Code Hook Configuration**:
   - Detect Claude Code installation via `~/.claude/` or `.claude/` directories
   - Copy `hooks/claude/mdsel-reminder.sh` to `~/.claude/hooks/mdsel-reminder.sh`
   - Set executable permissions (755)
   - Merge PostToolUse hook into existing `~/.claude/settings.json` preserving existing hooks
5. **OpenCode Plugin Installation**:
   - Detect OpenCode installation via `~/.config/opencode/` or `.opencode/` directories
   - Build TypeScript plugin if needed
   - Copy plugin to OpenCode plugin directory
6. **Installation Verification**: Run validation checks and report status

### Success Criteria

- [ ] Script runs without syntax errors on Linux and macOS
- [ ] Correctly detects presence of Claude Code and OpenCode
- [ ] Installs skill file to correct location (`.claude/skills/mdsel/SKILL.md`)
- [ ] Configures Claude Code hook with proper settings.json merging (preserves existing hooks)
- [ ] Installs OpenCode plugin to correct location
- [ ] Sets executable permissions on shell scripts (755)
- [ ] Provides clear human-readable status output for each installation step
- [ ] Exits with appropriate status codes (0 for success, non-zero for errors)
- [ ] Handles missing dependencies gracefully (jq, mdsel CLI)
- [ ] Is idempotent (can be run multiple times safely)

## All Needed Context

### Context Completeness Check

This PRP provides complete context for implementing the installation script including:
- Exact file paths and directory structures
- Platform detection patterns
- settings.json merging logic with examples
- Shell script patterns and conventions
- Error handling and validation strategies
- References to research documents with implementation patterns

### Documentation & References

```yaml
# MUST READ - Critical implementation context
- file: plan/P1M4T1/research/installation_patterns.md
  why: Cross-platform shell scripting best practices, platform detection techniques, safe installation patterns
  critical: Use `set -euo pipefail`, graceful degradation patterns, backup strategies

- file: plan/P1M4T1/research/claude_code_hooks.md
  why: Claude Code hook discovery mechanism, settings.json structure, hook configuration patterns
  critical: PostToolUse hook JSON structure, settings.json merging to preserve existing hooks

- file: plan/P1M4T1/research/opencode_plugins.md
  why: OpenCode plugin installation locations and mechanisms
  critical: Plugin directory paths, TypeScript build requirements

- file: .claude/skills/mdsel/SKILL.md
  why: The skill file that must be installed - understand its structure and content
  pattern: YAML frontmatter with name, description, allowed-tools; markdown body with instructions

- file: hooks/claude/mdsel-reminder.sh
  why: The Claude Code hook script that must be installed and configured
  pattern: Shell script with stdin JSON parsing, jq usage, word count logic, non-blocking exit (always 0)
  gotcha: Uses `jq` for JSON parsing - must be available or gracefully degraded

- file: hooks/opencode/mdsel-reminder.ts
  why: The OpenCode plugin that must be installed
  pattern: TypeScript plugin using @opencode-ai/plugin, tool.execute.before/after hooks
  gotcha: Requires TypeScript compilation before installation

- file: hooks/opencode/package.json
  why: OpenCode plugin dependencies and build configuration
  pattern: Uses "type": "module", has build script with tsc, depends on @opencode-ai/plugin

- file: PRD.md
  why: Complete product requirements and specifications
  section: Sections 6.4 and 6.5 for hook implementation details, Section 7 for deliverables

- file: tasks.json
  why: Detailed task breakdown with point values and subtasks
  section: P1.M4.T1 and its subtasks (P1.M4.T1.S1 through P1.M4.T1.S6)
```

### Current Codebase Tree

```bash
mdsel-skill/
├── .claude/
│   └── skills/
│       └── mdsel/
│           └── SKILL.md              # Skill file to be installed
├── hooks/
│   ├── claude/
│   │   └── mdsel-reminder.sh         # Claude Code hook to be installed
│   └── opencode/
│       ├── mdsel-reminder.ts         # OpenCode plugin to be installed
│       ├── package.json              # Plugin dependencies
│       ├── package-lock.json
│       └── tsconfig.json             # TypeScript config
├── plan/
│   ├── docs/                         # Research documentation
│   └── P1M4T1/
│       └── research/                 # Installation research docs
├── package.json                      # Root package (minimal, needs enhancement)
├── package-lock.json
├── PRD.md                            # Product requirements
└── tasks.json                        # Implementation tracking
```

### Desired Codebase Tree with Files to be Added

```bash
mdsel-skill/
├── install.sh                        # NEW: Cross-platform installation script
├── package.json                      # MODIFY: Add bin entry and postinstall script
├── [existing files unchanged...]
```

### Known Gotchas & Library Quirks

```bash
# CRITICAL: Claude Code settings.json merging
# - Must preserve existing hooks, not overwrite entire file
# - Use jq or manual JSON merging to add PostToolUse hook
# - If jq not available, provide alternative or graceful degradation

# CRITICAL: Platform-specific directory locations
# - Claude Code: ~/.claude/ for user-level, .claude/ for project-level
# - OpenCode: ~/.config/opencode/ or .opencode/ for workspace
# - Skill location: .claude/skills/ works for BOTH platforms

# CRITICAL: Shell script portability
# - Use bash shebang: #!/usr/bin/env bash
# - Always use: set -euo pipefail
# - Word count: wc -w < file (not cat file | wc -w) for BSD/GNU compatibility
# - Check command existence with: command -v jq >/dev/null 2>&1

# CRITICAL: OpenCode plugin requires compilation
# - Must run "npm run build" in hooks/opencode/ before copying
# - Output .js files are what actually gets loaded

# CRITICAL: mdsel CLI may not be in PATH
# - Check with: command -v mdsel
# - Fallback: npx mdsel (should always work if npm is available)
# - Warn user if neither works but don't fail installation

# CRITICAL: Permissions
# - Hook scripts must be executable (chmod 755 or chmod +x)
# - Directories may need creation with mkdir -p
```

## Implementation Blueprint

### Data Models and Structure

No complex data models needed for shell script. Key data structures:

```bash
# Platform detection results
PLATFORM_DETECTED=""  # "linux" or "darwin"
CLAUDE_CODE_INSTALLED=false
OPENCODE_INSTALLED=false

# Installation targets
CLAUDE_CONFIG_DIR=""  # ~/.claude/ or .claude/
OPENCODE_CONFIG_DIR="" # ~/.config/opencode/ or .opencode/

# mdsel CLI availability
MDSEL_IN_PATH=false
MDSEL_VIA_NPX=false
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE install.sh with shebang and safety setup
  - IMPLEMENT: Shebang #!/usr/bin/env bash for portability
  - IMPLEMENT: set -euo pipefail for error safety
  - IMPLEMENT: Main function structure with clear sections
  - FOLLOW pattern: hooks/claude/mdsel-reminder.sh (script structure, error handling)
  - NAMING: install.sh in project root
  - PLACEMENT: Project root directory

Task 2: IMPLEMENT platform detection functions
  - IMPLEMENT: detect_os() - identifies Linux vs macOS via uname
  - IMPLEMENT: detect_claude_code() - checks for ~/.claude/ or .claude/ directories
  - IMPLEMENT: detect_opencode() - checks for ~/.config/opencode/ or .opencode/ directories
  - IMPLEMENT: detect_shell_config() - identifies .bashrc, .zshrc, etc.
  - FOLLOW pattern: plan/P1M4T1/research/installation_patterns.md (platform detection section)
  - NAMING: Function names use snake_case with detect_* prefix
  - PLACEMENT: In install.sh after main function definition

Task 3: IMPLEMENT mdsel CLI verification
  - IMPLEMENT: verify_mdsel_cli() - checks if mdsel in PATH or via npx
  - USE: command -v mdsel for PATH check
  - USE: npx mdsel --version for npx availability
  - FALLBACK: Warn user if unavailable but don't fail (skill can still be installed)
  - NAMING: verify_mdsel_cli function
  - PLACEMENT: In install.sh after platform detection functions

Task 4: IMPLEMENT skill file installation
  - IMPLEMENT: install_skill() - creates .claude/skills/mdsel/ and copies SKILL.md
  - USE: mkdir -p for safe directory creation
  - USE: cp to copy .claude/skills/mdsel/SKILL.md to target
  - SOURCE: .claude/skills/mdsel/SKILL.md (relative to script location)
  - TARGET: ~/.claude/skills/mdsel/SKILL.md (user-level) or .claude/skills/mdsel/SKILL.md (project-level)
  - DETECT: Script location via SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
  - NAMING: install_skill function
  - DEPENDENCIES: Requires platform detection to know where to install
  - PLACEMENT: In install.sh after mdsel verification

Task 5: IMPLEMENT Claude Code hook configuration
  - IMPLEMENT: install_claude_hook() - copies hook script and configures settings.json
  - COPY: hooks/claude/mdsel-reminder.sh to ~/.claude/hooks/mdsel-reminder.sh
  - PERMISSIONS: chmod 755 on hook script
  - MERGE: Add PostToolUse hook to ~/.claude/settings.json
  - PRESERVE: Existing hooks using jq or manual merging
  - JSON STRUCTURE:
    ```json
    {
      "hooks": {
        "PostToolUse": [
          {
            "matcher": {"toolName": "Read"},
            "hook": {"type": "command", "command": "bash ~/.claude/hooks/mdsel-reminder.sh"}
          }
        ]
      }
    }
    ```
  - GOTCHA: If jq unavailable, use alternative JSON merging or warn user
  - FOLLOW pattern: plan/P1M4T1/research/claude_code_hooks.md (settings.json structure)
  - NAMING: install_claude_hook function
  - DEPENDENCIES: Requires Claude Code detection, skill installation
  - PLACEMENT: In install.sh after skill installation

Task 6: IMPLEMENT OpenCode plugin installation
  - IMPLEMENT: install_opencode_plugin() - builds and copies TypeScript plugin
  - BUILD: cd hooks/opencode/ && npm run build
  - COPY: Compiled .js files to OpenCode plugin directory
  - TARGET: ~/.config/opencode/plugins/mdsel-reminder/ or .opencode/plugins/mdsel-reminder/
  - DEPENDENCIES: TypeScript compiler, @opencode-ai/plugin package
  - GOTCHA: Must run npm install in hooks/opencode/ before build
  - FOLLOW pattern: plan/P1M4T1/research/opencode_plugins.md (plugin installation)
  - NAMING: install_opencode_plugin function
  - DEPENDENCIES: Requires OpenCode detection, node/npm availability
  - PLACEMENT: In install.sh after Claude Code hook installation

Task 7: IMPLEMENT installation verification
  - IMPLEMENT: verify_installation() - checks all installation targets
  - CHECK: Skill file exists at target location
  - CHECK: Hook script exists and is executable
  - CHECK: settings.json contains PostToolUse hook (if Claude Code installed)
  - CHECK: OpenCode plugin exists (if OpenCode installed)
  - OUTPUT: Clear status messages for each verification check
  - NAMING: verify_installation function
  - DEPENDENCIES: All installation functions must complete first
  - PLACEMENT: In install.sh after all installation functions

Task 8: IMPLEMENT main orchestration function
  - IMPLEMENT: main() function that calls all steps in order
  - FLOW: detect -> verify mdsel -> install skill -> install hooks -> verify
  - OUTPUT: Human-readable status messages for each step
  - EXIT: 0 on success, non-zero on critical failures
  - NAMING: main function
  - PLACEMENT: At end of install.sh, executed via main "$@"

Task 9: MODIFY package.json for npm distribution
  - ADD: "bin": {"install-mdsel-skill": "./install.sh"} entry
  - ADD: "postinstall": "bash ./install.sh" script
  - ADD: "files": array with ["install.sh", ".claude/", "hooks/", "README.md"]
  - PRESERVE: Existing dependencies (mdsel CLI)
  - FOLLOW pattern: npm package.json bin field conventions
  - PLACEMENT: Modify existing package.json in project root

Task 10: ADD executable permission to install.sh
  - IMPLEMENT: chmod +x install.sh
  - VERIFICATION: ls -l install.sh shows -rwxr-xr-x permissions
  - PLACEMENT: After script creation, in git or during npm pack
```

### Implementation Patterns & Key Details

```bash
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
# MDSL CLI VERIFICATION
# ============================================================================

verify_mdsel_cli() {
    # PATTERN: Check command existence with command -v
    # FALLBACK: npx mdsel always works if npm is available
    # GOTCHA: Don't fail installation if mdsel unavailable (skill can still be installed)

    if command -v mdsel >/dev/null 2>&1; then
        echo "✓ mdsel CLI found in PATH"
        MDSEL_AVAILABLE=true
        return 0
    fi

    # Try npx fallback
    if command -v npx >/dev/null 2>&1; then
        if npx mdsel --version >/dev/null 2>&1; then
            echo "✓ mdsel CLI available via npx"
            MDSEL_AVAILABLE=true
            return 0
        fi
    fi

    echo "⚠ mdsel CLI not found. Install with: npm install -g mdsel"
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

    echo "Installing mdsel skill..."

    # Create target directory
    mkdir -p "$HOME/.claude/skills/mdsel"

    # Copy skill file
    if [[ -f "$skill_source" ]]; then
        cp "$skill_source" "$skill_target"
        echo "✓ Skill installed to: $skill_target"
    else
        echo "✗ Skill source file not found: $skill_source"
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

    echo "Installing Claude Code hook..."

    # Create hooks directory
    mkdir -p "$HOME/.claude/hooks"

    # Copy hook script
    if [[ -f "$hook_source" ]]; then
        cp "$hook_source" "$hook_target"
        chmod 755 "$hook_target"
        echo "✓ Hook script installed to: $hook_target"
    else
        echo "✗ Hook source file not found: $hook_source"
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
        hook_exists=$(jq -r '.hooks.PostToolUse[]? | select(.hook.command | contains("mdsel-reminder"))' "$settings_file")

        if [[ -z "$hook_exists" ]]; then
            # Add the PostToolUse hook
            local tmp_file=$(mktemp)
            jq '
                .hooks.PostToolUse += [{
                    "matcher": {"toolName": "Read"},
                    "hook": {
                        "type": "command",
                        "command": "bash ~/.claude/hooks/mdsel-reminder.sh"
                    }
                }]
            ' "$settings_file" > "$tmp_file" && mv "$tmp_file" "$settings_file"
            echo "✓ Hook configured in settings.json"
        else
            echo "✓ Hook already configured in settings.json"
        fi
    else
        echo "⚠ jq not found. Please manually add the following to $settings_file:"
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

    echo "Installing OpenCode plugin..."

    # Check if OpenCode config directory exists
    if [[ -z "$OPENCODE_CONFIG_DIR" ]]; then
        echo "✗ OpenCode not detected, skipping plugin installation"
        return 0
    fi

    # Install dependencies and build plugin
    if [[ -d "$plugin_source_dir" ]]; then
        echo "Building TypeScript plugin..."
        (cd "$plugin_source_dir" && npm install >/dev/null 2>&1 && npm run build >/dev/null 2>&1)

        # Create target directory
        mkdir -p "$plugin_target_dir"

        # Copy compiled files
        cp "$plugin_source_dir"/mdsel-reminder.{js,map} "$plugin_target_dir/" 2>/dev/null || \
        cp "$plugin_source_dir"/mdsel-reminder.ts "$plugin_target_dir/"

        # Copy package.json for dependency resolution
        cp "$plugin_source_dir"/package.json "$plugin_target_dir/"

        echo "✓ Plugin installed to: $plugin_target_dir"
    else
        echo "✗ Plugin source directory not found: $plugin_source_dir"
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
        echo "✓ Skill file: $HOME/.claude/skills/mdsel/SKILL.md"
    else
        echo "✗ Skill file: NOT FOUND"
    fi

    # Check Claude Code hook (if Claude Code detected)
    if [[ -n "$CLAUDE_CONFIG_DIR" ]]; then
        if [[ -f "$HOME/.claude/hooks/mdsel-reminder.sh" ]]; then
            echo "✓ Claude Code hook: $HOME/.claude/hooks/mdsel-reminder.sh"
        else
            echo "✗ Claude Code hook: NOT FOUND"
        fi
    fi

    # Check OpenCode plugin (if OpenCode detected)
    if [[ -n "$OPENCODE_CONFIG_DIR" ]]; then
        if [[ -d "$HOME/.config/opencode/plugins/mdsel-reminder" ]]; then
            echo "✓ OpenCode plugin: $HOME/.config/opencode/plugins/mdsel-reminder"
        else
            echo "✗ OpenCode plugin: NOT FOUND"
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
    local os=$(detect_os)
    echo "Detected OS: $os"

    if detect_claude_code; then
        echo "✓ Claude Code detected at: $CLAUDE_CONFIG_DIR"
    else
        echo "○ Claude Code: not detected"
    fi

    if detect_opencode; then
        echo "✓ OpenCode detected at: $OPENCODE_CONFIG_DIR"
    else
        echo "○ OpenCode: not detected"
    fi

    echo ""

    # Verify mdsel CLI
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
```

### Integration Points

```yaml
PACKAGE.JSON:
  - modify: package.json (project root)
  - add bin: {"install-mdsel-skill": "./install.sh"}
  - add postinstall: "bash ./install.sh"
  - add files: ["install.sh", ".claude/", "hooks/", "README.md"]

SHELL INTEGRATION:
  - chmod +x install.sh (executable permission)
  - Can be run: ./install.sh or bash ./install.sh
  - Can be piped: curl -fsSL https://... | bash

CLAUDE CODE:
  - skill location: ~/.claude/skills/mdsel/SKILL.md
  - hook location: ~/.claude/hooks/mdsel-reminder.sh
  - settings location: ~/.claude/settings.json

OPENCODE:
  - skill location: ~/.claude/skills/mdsel/SKILL.md (same as Claude Code)
  - plugin location: ~/.config/opencode/plugins/mdsel-reminder/
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after creating install.sh - fix before proceeding

# Shell script syntax checking
shellcheck install.sh || echo "shellcheck not installed, skipping"

# Check for executable permission
ls -l install.sh
# Expected: -rwxr-xr-x (executable)

# Test script dry-run (syntax check)
bash -n install.sh
# Expected: No output (no syntax errors)

# Source the script to check for errors without running main
bash -c 'source ./install.sh; echo "Script loaded successfully"'
# Expected: Script loaded successfully

# Expected: Zero syntax errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test individual functions by sourcing and calling them

# Test platform detection
bash -c '
source ./install.sh
echo "OS: $(detect_os)"
detect_claude_code && echo "Claude Code: $CLAUDE_CONFIG_DIR" || echo "Claude Code: not found"
detect_opencode && echo "OpenCode: $OPENCODE_CONFIG_DIR" || echo "OpenCode: not found"
'

# Test mdsel verification
bash -c '
source ./install.sh
verify_mdsel_cli
echo "mdsel available: $MDSEL_AVAILABLE"
'

# Test skill file existence check
bash -c '
source ./install.sh
SCRIPT_DIR="$(pwd)"
if [[ -f ".claude/skills/mdsel/SKILL.md" ]]; then
    echo "✓ Skill source file exists"
else
    echo "✗ Skill source file not found"
fi
'

# Expected: All functions execute without errors, correct detections work
```

### Level 3: Integration Testing (System Validation)

```bash
# Test actual installation in a clean environment

# Create a temporary test directory
TEST_DIR=$(mktemp -d)
cd "$TEST_DIR"

# Copy project files to test directory
cp -r /path/to/mdsel-skill/* .

# Run installation script
bash ./install.sh

# Verify skill installation
test -f "$HOME/.claude/skills/mdsel/SKILL.md" && echo "✓ Skill installed" || echo "✗ Skill not installed"

# Verify hook script installation (if Claude Code detected)
test -f "$HOME/.claude/hooks/mdsel-reminder.sh" && echo "✓ Hook installed" || echo "✗ Hook not installed"
test -x "$HOME/.claude/hooks/mdsel-reminder.sh" && echo "✓ Hook executable" || echo "✗ Hook not executable"

# Verify settings.json modification (if jq available)
if command -v jq >/dev/null 2>&1; then
    jq -e '.hooks.PostToolUse[] | select(.hook.command | contains("mdsel-reminder"))' "$HOME/.claude/settings.json" >/dev/null 2>&1 && \
    echo "✓ settings.json configured" || echo "✗ settings.json not configured"
fi

# Verify OpenCode plugin (if OpenCode detected)
test -d "$HOME/.config/opencode/plugins/mdsel-reminder" && echo "✓ OpenCode plugin installed" || echo "○ OpenCode plugin not installed"

# Test idempotency (run again, should not fail)
bash ./install.sh
echo "✓ Idempotency test passed"

# Cleanup
cd /
rm -rf "$TEST_DIR"

# Expected: All installation targets verified, script is idempotent
```

### Level 4: Cross-Platform Validation

```bash
# Platform-specific testing (run on actual platforms)

# macOS testing
echo "Testing on macOS..."
# Run: sw_vers to verify macOS version
# Run: bash ./install.sh
# Verify: All components install correctly

# Linux testing
echo "Testing on Linux..."
# Run: uname -a to verify Linux distribution
# Run: bash ./install.sh
# Verify: All components install correctly

# Test with different shell configurations
echo "Testing with different shells..."

# Bash
bash -c './install.sh'

# Zsh (if available)
if command -v zsh >/dev/null 2>&1; then
    zsh -c './install.sh'
fi

# Test npm installation workflow
echo "Testing npm postinstall..."
npm pack
npm install -g mdsel-skill-*.tgz
# Check that postinstall ran: verify installation targets exist
npm uninstall -g mdsel-skill

# Expected: Script works on both Linux and macOS, with different shells
```

## Final Validation Checklist

### Technical Validation

- [ ] Shell script passes shellcheck validation with zero errors
- [ ] Script has executable permissions (chmod +x)
- [ ] Syntax check passes (bash -n install.sh)
- [ ] All functions execute without errors
- [ ] Exits with status code 0 on success
- [ ] Exits with non-zero status on critical failures

### Feature Validation

- [ ] Correctly detects OS (Linux/macOS)
- [ ] Correctly detects Claude Code installation
- [ ] Correctly detects OpenCode installation
- [ ] Installs skill file to ~/.claude/skills/mdsel/SKILL.md
- [ ] Installs hook script to ~/.claude/hooks/mdsel-reminder.sh
- [ ] Hook script has executable permissions (755)
- [ ] Merges PostToolUse hook into settings.json (preserves existing hooks)
- [ ] Installs OpenCode plugin if OpenCode detected
- [ ] Provides clear status output for each step
- [ ] Handles missing dependencies gracefully (jq, mdsel CLI)
- [ ] Script is idempotent (can be run multiple times safely)

### Code Quality Validation

- [ ] Uses set -euo pipefail for safety
- [ ] Uses #!/usr/bin/env bash for portability
- [ ] Functions use snake_case naming
- [ ] Comments explain non-obvious logic
- [ ] Error messages are clear and actionable
- [ ] Follows existing patterns from mdsel-reminder.sh
- [ ] package.json includes bin and postinstall configuration

### Documentation & Deployment

- [ ] Script has clear header comment explaining purpose
- [ ] Status messages are human-readable
- [ ] Error messages suggest fixes
- [ ] README.md will include installation instructions (separate task P1.M5.T1)

---

## Anti-Patterns to Avoid

- ❌ Don't hardcode paths - use detected or configurable paths
- ❌ Don't overwrite settings.json - merge to preserve existing hooks
- ❌ Don't fail installation if mdsel CLI unavailable - warn but continue
- ❌ Don't use bash-specific features without #!/bin/bash shebang
- ❌ Don't skip error handling - use set -euo pipefail
- ❌ Don't assume jq is available - provide fallback
- ❌ Don't forget to set executable permissions on hook scripts
- ❌ Don't build OpenCode plugin in-place - build then copy
- ❌ Don't use cat file | wc -w - use wc -w < file for portability
- ❌ Don't suppress all errors - provide clear status output
