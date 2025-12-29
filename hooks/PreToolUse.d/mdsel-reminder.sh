#!/bin/bash
# hooks/PreToolUse.d/mdsel-reminder.sh
# matcher: {"toolNames": ["Read"]}

# -----------------------------------------------------------------------------
# PATTERN 1: Fail-Open Error Handling
# Hook must never block the agent - all errors result in bare approval
# -----------------------------------------------------------------------------

# Check if jq is available (required for JSON parsing)
if ! command -v jq &> /dev/null; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 2: Read JSON Input from Stdin
# Claude Code sends JSON payload via stdin with tool_input.file_path field
# -----------------------------------------------------------------------------

INPUT=$(cat)

# Validate JSON is well-formed
if ! echo "$INPUT" | jq . > /dev/null 2>&1; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 3: Extract File Path with Default
# Use jq -r for raw string (no quotes), // empty for default if missing
# -----------------------------------------------------------------------------

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If no file path, approve (fail open)
if [[ -z "$FILE_PATH" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 4: Markdown File Detection (Extension Check)
# Check for .md extension (case-insensitive)
# -----------------------------------------------------------------------------

# Get file extension (lowercase for case-insensitive comparison)
EXTENSION="${FILE_PATH##*.}"
EXTENSION="${EXTENSION,,}"  # Bash 4+ lowercase conversion

# Only process Markdown files
if [[ "$EXTENSION" != "md" && "$EXTENSION" != "markdown" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 5: File Existence and Readability Check
# Ensure file exists before attempting word count
# -----------------------------------------------------------------------------

if [[ ! -f "$FILE_PATH" || ! -r "$FILE_PATH" ]]; then
  echo '{"decision": "approve"}'
  exit 0
fi

# -----------------------------------------------------------------------------
# PATTERN 6: Mechanical Word Count using wc -w
# CRITICAL: Use redirection (<) to avoid filename in output
# This matches TypeScript countWords utility behavior exactly
# -----------------------------------------------------------------------------

WORD_COUNT=$(wc -w < "$FILE_PATH" 2>/dev/null || echo "0")

# Validate word count is numeric
if ! [[ "$WORD_COUNT" =~ ^[0-9]+$ ]]; then
  WORD_COUNT=0
fi

# -----------------------------------------------------------------------------
# PATTERN 7: Threshold Configuration with Default
# Use MDSEL_MIN_WORDS environment variable, default to 200 if unset
# -----------------------------------------------------------------------------

THRESHOLD="${MDSEL_MIN_WORDS:-200}"

# Validate threshold is numeric
if ! [[ "$THRESHOLD" =~ ^[0-9]+$ ]]; then
  THRESHOLD=200
fi

# -----------------------------------------------------------------------------
# PATTERN 8: Canonical Reminder Response
# EXACT message wording - no variation allowed
# Always return decision: "approve" with optional reason field
# -----------------------------------------------------------------------------

if [[ "$WORD_COUNT" -gt "$THRESHOLD" ]]; then
  # CRITICAL: This message must be EXACT as specified in PRD Section 6.3
  echo '{"decision": "approve", "reason": "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}'
else
  echo '{"decision": "approve"}'
fi

# -----------------------------------------------------------------------------
# PATTERN 9: Clean Exit
# Always exit 0 - non-zero exit codes may be treated as hook failures
# -----------------------------------------------------------------------------

exit 0
