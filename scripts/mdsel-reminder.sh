#!/usr/bin/env bash
#
# mdsel-reminder.sh - PostToolUse hook for Claude Code
#
# Reminds agents to use mdsel instead of Read when accessing large Markdown files.
#
# Trigger: PostToolUse hook after Read tool executes
# Input: JSON via stdin with tool_name, tool_input, tool_response
# Output: JSON with hookSpecificOutput.additionalContext if threshold exceeded
# Exit: Always 0 (non-blocking)

set -euo pipefail

# Main function
main() {
    # Read JSON input from stdin
    local hook_input
    hook_input=$(cat)

    # Check if jq is available
    if ! command -v jq >/dev/null 2>&1; then
        # Graceful degradation - exit silently if jq not available
        exit 0
    fi

    # Extract file_path using jq with null safety
    local file_path
    file_path=$(echo "$hook_input" | jq -r '.tool_input.file_path // ""' 2>/dev/null) || exit 0

    # Early exit if no file path
    [[ -z "$file_path" ]] && exit 0

    # Early exit if not a Markdown file
    [[ "$file_path" != *.md ]] && exit 0

    # Count words with cross-platform compatible wc
    # Use < redirect to get just the number (handles GNU/BSD differences)
    local word_count
    word_count=$(wc -w < "$file_path" 2>/dev/null || echo 0)

    # Get threshold from environment with default of 200
    local threshold="${MDSEL_MIN_WORDS:-200}"

    # Check if threshold exceeded
    if [[ "$word_count" -gt "$threshold" ]]; then
        # Output normative reminder as JSON
        # Wording is normative per PRD.md section 6.3 - no variation allowed
        echo '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"This is a Markdown file over the configured size threshold.\nUse `mdsel <selector> <file>` instead of Read."}}'
    fi

    # Always exit 0 (non-blocking)
    exit 0
}

# Execute main function
main "$@"
