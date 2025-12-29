# Claude Code PreToolUse Hook Documentation

## PreToolUse Hook Installation

The `mdsel-reminder.sh` PreToolUse hook automatically reminds you to use `mdsel_index` and `mdsel_select` when accessing large Markdown files.

### What It Does

- **Fires on**: Every `Read` tool invocation for `.md` or `.markdown` files
- **Checks**: Word count using mechanical `wc -w` (whitespace-delimited)
- **Triggers**: When file exceeds `MDSEL_MIN_WORDS` threshold (default: 200 words)
- **Returns**: Non-blocking reminder message in the agent response
- **Does NOT block**: The Read operation proceeds normally - this is informational only

**Example reminder message**:
> "This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."

### Why Use the Hook

- **Token Efficiency**: Large Markdown files consume excessive tokens when read entirely
- **Surgical Access**: `mdsel_select` provides targeted section retrieval
- **Behavioral Conditioning**: Consistent reminders guide efficient tool usage patterns

### Prerequisites

Before installing the hook, ensure you have:

1. **jq** (JSON processor) - Required for parsing Claude Code's JSON input
   ```bash
   # Install jq on Ubuntu/Debian
   sudo apt-get install jq

   # Install jq on macOS
   brew install jq

   # Install jq on Fedora/CentOS
   sudo dnf install jq

   # Verify installation
   jq --version
   ```

2. **Bash/Shell Access** - Standard on Linux/macOS, WSL on Windows

3. **Claude Code Installed** - Hook integrates with Claude Code's PreToolUse system

### Quick Install

```bash
# Create hooks directory (if it doesn't exist)
mkdir -p ~/.claude/hooks/PreToolUse.d/

# Copy hook from project to Claude Code hooks directory
cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/

# Make hook executable
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

**Note**: You must be in the project directory for the `cp` command to work. Alternatively, use the full path to the hook file.

### Installation Steps

**Step 1: Create the hooks directory**

Claude Code stores PreToolUse hooks in `~/.claude/hooks/PreToolUse.d/`. This directory may not exist by default.

```bash
mkdir -p ~/.claude/hooks/PreToolUse.d/
```

The `-p` flag ensures no error if the directory already exists.

**Step 2: Copy the hook script**

Copy the hook from the project to your Claude Code hooks directory:

```bash
cp hooks/PreToolUse.d/mdsel-reminder.sh ~/.claude/hooks/PreToolUse.d/
```

**Step 3: Make the hook executable**

Claude Code requires hook scripts to be executable:

```bash
chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
```

**Step 4: Restart Claude Code (if running)**

Claude Code loads hooks on startup. Restart Claude Code to activate the new hook.

### Configuration

The hook uses the `MDSEL_MIN_WORDS` environment variable to control the word count threshold.

**Default behavior**: 200 words

**Set custom threshold** (session only):
```bash
export MDSEL_MIN_WORDS=500
```

**Set custom threshold** (persistent - add to shell profile):

For Bash (`~/.bashrc`):
```bash
echo 'export MDSEL_MIN_WORDS=500' >> ~/.bashrc
source ~/.bashrc
```

For Zsh (`~/.zshrc`):
```bash
echo 'export MDSEL_MIN_WORDS=500' >> ~/.zshrc
source ~/.zshrc
```

**Verify configuration**:
```bash
echo $MDSEL_MIN_WORDS
# Output: 200 (default) or your custom value
```

**How it works**: Files with word counts **over** the threshold trigger the reminder. A 201-word file with default threshold (200) will trigger; a 200-word file will not.

### Verification

**Check the hook is installed**:
```bash
ls -la ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh
# Expected: -rwxr-xr-x (executable permissions)
```

**Check the hook content**:
```bash
cat ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh | head -2
# Expected output:
# #!/bin/bash
# # matcher: {"toolNames": ["Read"]}
```

**Test the hook manually**:
```bash
# Create a test Markdown file with 201+ words
echo "# Test File" > /tmp/test-large.md
for i in {1..201}; do echo "word$i"; done >> /tmp/test-large.md

# Simulate a Read tool invocation
echo '{"tool_input":{"file_path":"/tmp/test-large.md"}}' | \
  ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh

# Expected output:
# {"decision":"approve","reason":"This is a Markdown file over the configured size threshold. Use mdsel_index and mdsel_select instead of Read."}
```

**Test with Claude Code**:
1. Create a Markdown file with 201+ words
2. Use Claude Code to read the file (invokes Read tool)
3. Observe the reminder message in the agent response

### Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Permission denied when running hook | Hook is not executable | Run `chmod +x ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh` |
| Hook doesn't fire (no reminder) | `jq` is not installed | Install jq: `sudo apt-get install jq` or `brew install jq` |
| Hook doesn't fire on .md file | File is under threshold | File must exceed `MDSEL_MIN_WORDS` (default: 200) |
| Hook doesn't fire on .txt file | Hook only processes Markdown files | Only `.md` and `.markdown` files trigger the hook |
| Hook shows reminder for ALL files | `MDSEL_MIN_WORDS` set too low | Set appropriate threshold or unset to use default (200) |
| "No such file or directory" error | Hooks directory doesn't exist | Run `mkdir -p ~/.claude/hooks/PreToolUse.d/` first |
| Hook not detected by Claude Code | Claude Code needs restart | Restart Claude Code after installing the hook |
| Can't install on Windows | Native Windows doesn't support bash | Use WSL (Windows Subsystem for Linux) or Git Bash |

### Uninstallation

To remove the hook:

```bash
# Remove the hook script
rm ~/.claude/hooks/PreToolUse.d/mdsel-reminder.sh

# Optionally, remove the hooks directory if empty
rmdir ~/.claude/hooks/PreToolUse.d/ 2>/dev/null

# Remove MDSEL_MIN_WORDS from shell profile (if previously added)
# Edit ~/.bashrc or ~/.zshrc and remove the export line
```

Restart Claude Code to complete the uninstallation.
