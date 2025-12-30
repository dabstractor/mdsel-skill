# Bash Scripting Best Practices

## 1. Parsing JSON Input from stdin

### Using jq (Recommended)
```bash
#!/usr/bin/env bash

# Read JSON from stdin with error handling
read_json_input() {
    local json_input
    if ! json_input=$(cat); then
        echo "Error reading input" >&2
        exit 1
    fi

    # Validate JSON structure
    if ! jq empty <<< "$json_input" >/dev/null 2>&1; then
        echo "Error: Invalid JSON input" >&2
        exit 1
    fi

    echo "$json_input"
}

# Extract specific field
extract_field() {
    local json="$1"
    local field="$2"
    echo "$json" | jq -r ".$field" 2>/dev/null || echo ""
}

# Example usage
main() {
    set -euo pipefail
    local json
    json=$(read_json_input)

    local name
    name=$(extract_field "$json" "name")
    local age
    age=$(extract_field "$json" "age")

    echo "Name: ${name:-N/A}, Age: ${age:-N/A}"
}

main "$@"
```

### Stream Processing for Large JSON
```bash
# Process JSON array elements efficiently
process_users() {
    jq -c '.users[]' | while read -r user; do
        local name
        name=$(echo "$user" | jq -r '.name')
        echo "Processing user: $name"
        # Additional processing
    done
}

# Pipeline example
cat users.json | process_users
```

## 2. Word Counting in Markdown Files

### Basic Word Count
```bash
#!/usr/bin/env bash

count_words_file() {
    local file="$1"
    # Count total words including headers and links
    wc -w < "$file"
}

# Recursive count with total
count_words_recursive() {
    local dir="${1:-.}"
    find "$dir" -name "*.md" -type f -exec wc -w {} + | tail -1
}
```

### Markdown-Aware Word Counting
```bash
# Remove markdown syntax before counting
count_clean_words() {
    local file="$1"
    sed 's/^#*//g' "$file" |           # Remove headers
    sed 's/\[.*\](.*)//g' |             # Remove links
    sed 's/```.*```//g' |               # Remove code blocks
    sed 's/~~//g; s/\*\*//g; s/\*//g' | # Remove formatting
    tr '[:space:]' '\n' |               # Split on whitespace
    grep -v '^[[:space:]]*$' |          # Remove empty lines
    wc -l                              # Count non-empty words
}

# More accurate with awk
count_words_awk() {
    local file="$1"
    awk '
    {
        gsub(/#+[[:space:]]*/, "")    # Remove headers
        gsub(/\[.*\]\([^)]*\)/, "")   # Remove links
        gsub(/```.*```/, "")          # Remove code blocks
        gsub(/~~/, "")                # Remove strikethrough
        gsub(/\*\*/, "")              # Remove bold
        gsub(/\*/, "")                # Remove italic
        gsub(/[[:space:]]+/, " ")    # Normalize whitespace
        gsub(/^ | $/, "")             # Trim spaces
        if ($0 != "") print $0        # Print non-empty lines
    }' "$file" | wc -w
}

# Summary report for all markdown files
markdown_word_report() {
    local dir="${1:-.}"
    find "$dir" -name "*.md" -type f -exec sh -c '
        file="$1"
        total=$(wc -w < "$file")
        clean=$(count_words_awk "$file")
        echo "$file: Total=$total, Clean=$clean"
    ' _ {} \;
}
```

## 3. Cross-Platform Bash Scripting

### Shebang Best Practices
```bash
#!/usr/bin/env bash                    # Most portable
# OR
#!/bin/bash                           # Explicit path
# OR for maximum compatibility:
#!/bin/sh                              # POSIX only
```

### Version Compatibility Patterns
```bash
# Check bash version
if [ -n "$BASH_VERSION" ]; then
    # Bash-specific features
    declare -A associative_array  # Requires bash 4+
fi

# Check for bash 4+ features
if [ "${BASH_VERSINFO:-0}" -ge 4 ]; then
    # Use associative arrays
    declare -A config
    config[key]="value"
else
    # Fallback for older bash
    config_key="value"
fi

# GNU vs BSD compatibility
if grep -q --version <<< "GNU" 2>/dev/null; then
    # GNU grep options
    grep -P "pattern" file
else
    # BSD grep alternatives
    grep -E "pattern" file
fi
```

### Platform Detection
```bash
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
    elif [[ "$OSTYPE" == "freebsd"* ]]; then
        PLATFORM="freebsd"
    else
        PLATFORM="unknown"
    fi
}

# Platform-specific commands
get_file_size() {
    local file="$1"
    case "$PLATFORM" in
        linux|freebsd)
            stat -c "%s" "$file"
            ;;
        macos)
            stat -f "%z" "$file"
            ;;
        *)
            wc -c < "$file"
            ;;
    esac
}
```

## 4. Error Handling Patterns

### Basic Error Handling Template
```bash
#!/usr/bin/env bash

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Cleanup function
cleanup() {
    local exit_code=$?
    echo "Cleaning up..."
    # Remove temporary files
    rm -f /tmp/script_*
    # Restore original state
    # ...
    exit $exit_code
}

# Error handler
error_handler() {
    local exit_code=$?
    local line_number=$1
    echo "Error on line $line_number: Command failed with exit code $exit_code" >&2
    cleanup
    exit $exit_code
}

# Set traps
trap 'error_handler $LINENO' ERR
trap cleanup EXIT INT TERM

# Main function
main() {
    echo "Script started"

    # Example operations
    if ! command_that_might_fail; then
        echo "Command failed" >&2
        exit 1
    fi

    echo "Script completed successfully"
}

# Check required commands
check_requirements() {
    local missing=()
    for cmd in jq awk sed; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing+=("$cmd")
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        echo "Missing required commands: ${missing[*]}" >&2
        exit 1
    fi
}

# Run main
check_requirements
main "$@"
```

### Advanced Error Handling
```bash
# Function with error propagation
run_command() {
    local cmd="$1"
    local args=("${@:2}")

    if ! "${cmd}" "${args[@]}" 2>/dev/null; then
        local exit_code=$?
        echo "Command failed: $cmd" >&2
        return $exit_code
    fi
    return 0
}

# Retry mechanism with exponential backoff
retry_command() {
    local max_attempts=3
    local delay=1
    local attempt=1
    local cmd="$1"
    local args=("${@:2}")

    while [ $attempt -le $max_attempts ]; do
        if "${cmd}" "${args[@]}"; then
            return 0
        fi

        if [ $attempt -lt $max_attempts ]; then
            echo "Attempt $attempt failed, retrying in $delay seconds..." >&2
            sleep $delay
            delay=$((delay * 2))
        fi
        attempt=$((attempt + 1))
    done

    echo "Command failed after $max_attempts attempts: $cmd" >&2
    return 1
}
```

## 5. JSON Parsing Tools and Alternatives

### jq Installation and Usage
```bash
# Check/install jq
ensure_jq() {
    if ! command -v jq >/dev/null 2>&1; then
        echo "Installing jq..."
        if command -v apt >/dev/null 2>&1; then
            sudo apt-get install -y jq
        elif command -v brew >/dev/null 2>&1; then
            brew install jq
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y jq
        else
            echo "Cannot install jq automatically. Please install manually." >&2
            exit 1
        fi
    fi
}

# Common jq patterns
parse_json() {
    local json="$1"

    # Extract values
    local name
    name=$(echo "$json" | jq -r '.name // empty')

    # Handle arrays
    local items
    items=$(echo "$json" | jq -c '.items[]?' 2>/dev/null || echo "")

    # Transform JSON
    local transformed
    transformed=$(echo "$json" | jq '
        if . then
            {
                id: .id,
                display_name: .name // "Unknown",
                metadata: {
                    created: .created_at,
                    tags: (.tags // []) | map(. | ascii_upcase)
                }
            }
        else empty
        end
    ')
}
```

### Alternative JSON Tools

#### jc (JSON Convert)
```bash
# Installation via pip
pip install jc

# Usage
ps aux | jc --ps | jq '.[].cmd'
```

#### gron
```bash
# Installation
# Download from https://github.com/tomnomnom/gron

# Usage
cat data.json | gron | grep "name" | gron -u
```

#### Python Fallback
```bash
parse_json_fallback() {
    local json="$1"
    local field="$2"

    # Use Python when jq is not available
    python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
    print(data.get('$field', ''))
except:
    print('')
" <<< "$json"
}
```

### JSON Schema Validation
```bash
validate_json_schema() {
    local json="$1"
    local schema_file="$2"

    # Use jq for basic validation
    if echo "$json" | jq empty >/dev/null 2>&1; then
        # Additional schema validation would require more tools
        echo "JSON is valid"
        return 0
    else
        echo "JSON is invalid" >&2
        return 1
    fi
}
```

## Production-Ready Template

```bash
#!/usr/bin/env bash

# Script template with all best practices
set -euo pipefail

# Configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TEMP_DIR="${TMPDIR:-/tmp}/${SCRIPT_NAME}.$$"

# Logging
log_info() { echo "[INFO] $*" >&2; }
log_warn() { echo "[WARN] $*" >&2; }
log_error() { echo "[ERROR] $*" >&2; }

# Cleanup
cleanup() {
    local exit_code=$?
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
    log_info "Script completed with exit code: $exit_code"
    exit $exit_code
}

# Signal handling
trap cleanup EXIT INT TERM

# Main function
main() {
    log_info "Starting $SCRIPT_NAME"

    # Create temp directory
    mkdir -p "$TEMP_DIR"

    # Main logic here
    log_info "Script completed successfully"
}

# Check requirements
check_requirements() {
    local required_commands=("jq" "awk" "sed")
    local missing=()

    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            missing+=("$cmd")
        fi
    done

    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required commands: ${missing[*]}"
        exit 1
    fi
}

# Run main function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_requirements
    main "$@"
fi
```