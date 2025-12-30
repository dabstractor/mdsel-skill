# Cross-Platform Installation Script Best Practices

## Table of Contents
- [Shell Script Installation Patterns](#shell-script-installation-patterns)
- [Platform Detection Techniques](#platform-detection-techniques)
- [Package Manager Installation Patterns](#package-manager-installation-patterns)
- [Installation Verification Strategies](#installation-verification-strategies)
- [Safe Installation Practices](#safe-installation-practices)
- [CLI Tool Extension Patterns](#cli-tool-extension-patterns)
- [Implementation Examples](#implementation-examples)

## Shell Script Installation Patterns

### Best Practices for install.sh Scripts

1. **Use bash explicitly**
   ```bash
   #!/bin/bash
   set -euo pipefail  # Fail fast
   ```

2. **Check for bash requirement**
   ```bash
   if [ -z "${BASH_VERSION:-}" ]; then
     abort "Bash is required to interpret this script."
   fi
   ```

3. **Environment variable safety checks**
   ```bash
   if [[ -n "${INTERACTIVE-}" && -n "${NONINTERACTIVE-}" ]]; then
     abort 'Both `$INTERACTIVE` and `$NONINTERACTIVE` are set.'
   fi
   ```

4. **Interactive mode detection**
   ```bash
   if [[ -t 0 || -p /dev/stdin ]]; then
     INTERACTIVE=1
   else
     NONINTERACTIVE=1
   fi
   ```

### Safe Download Patterns

1. **Multiple download tool support**
   ```bash
   download_file() {
     local url="$1"
     local output="$2"

     if command -v curl >/dev/null 2>&1; then
       curl -fsSL "$url" -o "$output"
     elif command -v wget >/dev/null 2>&1; then
       wget -qO "$output" "$url"
     else
       abort "Neither curl nor wget is available"
     fi
   }
   ```

2. **Download verification**
   ```bash
   verify_checksum() {
     local file="$1"
     local expected="$2"
     local actual

     if command -v sha256sum >/dev/null 2>&1; then
       actual=$(sha256sum "$file" | cut -d' ' -f1)
     else
       actual=$(shasum -a 256 "$file" | cut -d' ' -f1)
     fi

     if [[ "$actual" != "$expected" ]]; then
       abort "Checksum verification failed"
     fi
   }
   ```

## Platform Detection Techniques

### OS Detection

```bash
detect_os() {
  OS="$(uname -s)"
  case "$OS" in
    Linux*)     PLATFORM=Linux;;
    Darwin*)    PLATFORM=Mac;;
    MINGW*)     PLATFORM=Windows;;
    CYGWIN*)    PLATFORM=Windows;;
    *)          PLATFORM="UNKNOWN:${OS}"
  esac
}

detect_architecture() {
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64)     ARCH=amd64;;
    arm64)      ARCH=arm64;;
    aarch64)    ARCH=arm64;;
    *)          ARCH="$ARCH"
  esac
}
```

### Shell Detection

```bash
detect_shell() {
  if [ -n "${BASH_VERSION:-}" ]; then
    SHELL=bash
  elif [ -n "${ZSH_VERSION:-}" ]; then
    SHELL=zsh
  elif [ -n "${KSH_VERSION:-}" ]; then
    SHELL=ksh
  else
    SHELL=unknown
  fi
}
```

### Configuration Directory Detection

```bash
get_config_dir() {
  local tool="$1"

  if [ -n "${XDG_CONFIG_HOME:-}" ]; then
    printf "%s/%s" "$XDG_CONFIG_HOME" "$tool"
  else
    printf "%s/.config/%s" "$HOME" "$tool"
  fi
}

get_bin_dir() {
  if [ -n "${LOCAL_BIN:-}" ]; then
    printf "%s" "$LOCAL_BIN"
  elif [ -d "$HOME/.local/bin" ]; then
    printf "%s/.local/bin" "$HOME"
  else
    printf "%s/bin" "$HOME"
  fi
}
```

## Package Manager Installation Patterns

### Homebrew Detection and Installation

```bash
install_homebrew() {
  if ! command -v brew >/dev/null 2>&1; then
    if [[ "$PLATFORM" == "Mac" ]]; then
      # macOS Homebrew installation
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
      abort "Homebrew is not supported on this platform"
    fi
  fi
}

brew_install_package() {
  local package="$1"

  if command -v brew >/dev/null 2>&1; then
    brew install "$package"
  else
    abort "Homebrew is not available"
  fi
}
```

### APT Package Manager (Debian/Ubuntu)

```bash
apt_install_package() {
  local package="$1"
  local sudo_cmd="sudo"

  if [[ $EUID -eq 0 ]]; then
    sudo_cmd=""
  fi

  $sudo_cmd apt-get update
  $sudo_cmd apt-get install -y "$package"
}
```

### YUM Package Manager (RHEL/CentOS)

```bash
yum_install_package() {
  local package="$1"
  local sudo_cmd="sudo"

  if [[ $EUID -eq 0 ]]; then
    sudo_cmd=""
  fi

  $sudo_cmd yum install -y "$package"
}
```

### NPM Package Installation

```bash
npm_install_package() {
  local package="$1"
  local global_flag="$2"  # --global or empty

  if command -v npm >/dev/null 2>&1; then
    npm install $global_flag "$package"
  else
    abort "npm is not available"
  fi
}

# Global installation with proper path handling
npm_install_global() {
  local package="$1"
  local npm_bin_dir

  if command -v npm >/dev/null 2>&1; then
    npm_bin_dir=$(npm bin --global)
    npm install --global "$package"
    add_to_path "$npm_bin_dir"
  fi
}
```

## Installation Verification Strategies

### Command Verification

```bash
verify_command() {
  local cmd="$1"
  local version_cmd="${2:-$cmd --version}"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    return 1
  fi

  # Test the command works
  if ! $version_cmd >/dev/null 2>&1; then
    return 1
  fi

  return 0
}
```

### Installation Integrity Check

```bash
verify_installation() {
  local install_path="$1"
  local expected_version="$2"
  local actual_version

  # Check file exists
  if [ ! -f "$install_path" ]; then
    return 1
  fi

  # Check file is executable
  if [ ! -x "$install_path" ]; then
    return 1
  fi

  # Check version
  if command -v "$install_path" >/dev/null 2>&1; then
    actual_version=$($install_path --version 2>/dev/null || echo "unknown")
    if [[ "$actual_version" != "$expected_version" ]]; then
      return 1
    fi
  fi

  return 0
}
```

## Safe Installation Practices

### Backup Existing Installations

```bash
backup_existing() {
  local tool_path="$1"

  if [ -f "$tool_path" ]; then
    local backup_path="${tool_path}.bak.$(date +%Y%m%d%H%M%S)"
    cp "$tool_path" "$backup_path"
    echo "Existing installation backed up to: $backup_path"
  fi
}
```

### Idempotent Installation

```bash
install_tool() {
  local tool_name="$1"
  local version="$2"
  local install_dir="$3"
  local download_url="$4"

  # Check if already installed and correct version
  local tool_bin="${install_dir}/${tool_name}"
  if verify_installation "$tool_bin" "$version"; then
    echo "$tool_name $version is already installed"
    return 0
  fi

  # Create backup if exists
  backup_existing "$tool_bin"

  # Download and install
  local temp_file
  temp_file=$(mktemp)
  trap 'rm -f "$temp_file"' EXIT

  download_file "$download_url" "$temp_file"
  verify_checksum "$temp_file" "$checksum"

  # Install
  mkdir -p "$install_dir"
  cp "$temp_file" "$tool_bin"
  chmod +x "$tool_bin"

  # Verify
  if ! verify_installation "$tool_bin" "$version"; then
    abort "Installation verification failed"
  fi

  echo "$tool_name $version installed successfully"
}
```

### Path Management

```bash
add_to_path() {
  local dir="$1"
  local shell_rc

  # Detect shell config file
  case "${SHELL##*/}" in
    bash)
      if [ -f "$HOME/.bashrc" ]; then
        shell_rc="$HOME/.bashrc"
      else
        shell_rc="$HOME/.profile"
      fi
      ;;
    zsh)
      shell_rc="$HOME/.zshrc"
      ;;
    *)
      shell_rc="$HOME/.profile"
      ;;
  esac

  # Check if already in PATH
  if [[ ":$PATH:" != *":$dir:"* ]]; then
    echo "export PATH=\"$dir:\$PATH\"" >> "$shell_rc"
    echo "Added $dir to PATH. Please restart your shell or source $shell_rc"
  fi
}
```

## CLI Tool Extension Patterns

### VS Code Extension Installation

```bash
install_vscode_extension() {
  local extension_id="$1"

  if command -v code >/dev/null 2>&1; then
    code --install-extension "$extension_id"
  else
    abort "Visual Studio Code is not installed"
  fi
}

# Batch extension installation
install_vscode_extensions() {
  local extensions=(
    "ms-vscode.cpptools"
    "ms-vscode.makefile-tools"
    "streetsidesoftware.code-spell-checker"
    "esbenp.prettier-vscode"
  )

  for ext in "${extensions[@]}"; do
    install_vscode_extension "$ext"
  done
}
```

### Claude Code Extension Patterns

```bash
install_claude_extensions() {
  local extensions_dir="$HOME/.config/claude-code/extensions"

  mkdir -p "$extensions_dir"

  # Install mdsel extension
  if [ ! -d "$extensions_dir/mdsel" ]; then
    git clone https://github.com/example/mdsel.git "$extensions_dir/mdsel"
  fi

  # Update if exists
  if [ -d "$extensions_dir/mdsel" ]; then
    cd "$extensions_dir/mdsel"
    git pull
  fi
}
```

## Implementation Examples

### Complete Cross-Platform Installer

```bash
#!/bin/bash

set -euo pipefail

# Configuration
TOOL_NAME="mytool"
VERSION="1.0.0"
GITHUB_REPO="myorg/mytool"
BIN_DIR=$(get_bin_dir)

# Platform detection
detect_os
detect_architecture

# Download URL with platform-specific naming
DOWNLOAD_URL="https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/${TOOL_NAME}-${PLATFORM}-${ARCH}.tar.gz"

# Installation
main() {
  echo "Installing ${TOOL_NAME} ${VERSION}..."

  # Check requirements
  for cmd in curl tar; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      abort "Required command '$cmd' is not installed"
    fi
  done

  # Create temp directory
  local temp_dir
  temp_dir=$(mktemp -d)
  trap 'rm -rf "$temp_dir"' EXIT

  # Download
  echo "Downloading from ${DOWNLOAD_URL}..."
  download_file "$DOWNLOAD_URL" "${temp_dir}/archive.tar.gz"

  # Extract
  tar -xzf "${temp_dir}/archive.tar.gz" -C "$temp_dir"

  # Find binary
  local binary_path
  binary_path=$(find "$temp_dir" -name "${TOOL_NAME}" -type f)
  if [ -z "$binary_path" ]; then
    abort "Could not find ${TOOL_NAME} binary in archive"
  fi

  # Install
  backup_existing "${BIN_DIR}/${TOOL_NAME}"
  mkdir -p "$BIN_DIR"
  cp "$binary_path" "$BIN_DIR/"
  chmod +x "${BIN_DIR}/${TOOL_NAME}"

  # Verify
  if ! verify_installation "${BIN_DIR}/${TOOL_NAME}" "$VERSION"; then
    abort "Installation verification failed"
  fi

  # Add to PATH
  add_to_path "$BIN_DIR"

  echo "Installation completed successfully!"
}

main "$@"
```

## References and Resources

### Documentation URLs

1. [Homebrew Installation Script](https://github.com/Homebrew/install/blob/master/install.sh)
   - Example of robust macOS/Linux package manager installation

2. [Node Version Manager (nvm) Install Script](https://github.com/nvm-sh/nvm/blob/master/install.sh)
   - Shows shell detection and configuration management

3. [GitHub CLI Installation](https://github.com/cli/cli/blob/main/docs/install_linux.md)
   - Example of official CLI tool installation patterns

4. [ShellCheck Static Analysis](https://www.shellcheck.net/)
   - Best practices for shell script validation

5. [GitHub Packages Installation Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
   - NPM package installation patterns

6. [NPM Global Installation Best Practices](https://docs.npmjs.com/cli/v8/configuring-npm/folders)
   - Understanding npm global installation paths

### Best Practice Resources

1. [Shell Scripting Best Practices](https://github.com/koalaman/shellcheck/wiki/ShellCheck-scripting)
   - Comprehensive shell script guidelines

2. [Cross-Platform Shell Scripting](https://alexpearce.me/2016/02/cross-platform-shell-scripting/)
   - Platform-specific considerations

3. [Safe Scripting in Bash](https://sipb.mit.edu/doc/safe-shell/)
   - Security considerations for install scripts

4. [Idempotent Installation Patterns](https://unix.stackexchange.com/questions/6345/how-can-i-add-a-directory-to-the-path)
   - Ensuring installations can be run multiple times

### Package Manager Guides

1. [Homebrew Documentation](https://docs.brew.sh/)
   - Package manager best practices

2. [APT Package Manager](https://manpages.ubuntu.com/manpages/xenial/man8/apt-get.8.html)
   - Debian/Ubuntu package management

3. [YUM Package Manager](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/sec-yum)
   - Red Hat family package management