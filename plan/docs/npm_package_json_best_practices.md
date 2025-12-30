# npm package.json Best Practices for CLI Tools and Distribution Packages

This document provides comprehensive guidance for creating effective package.json files that distribute shell scripts, static files, and CLI tools.

## Table of Contents

1. [Essential Fields for npm Packages](#essential-fields-for-npm-packages)
2. [Scripts Configuration](#scripts-configuration)
3. [Metadata Fields](#metadata-fields)
4. [Package Distribution Patterns](#package-distribution-patterns)
5. [Common Pitfalls and Gotchas](#common-pitfalls-and-gotchas)

---

## 1. Essential Fields for npm Packages that Distribute Shell Scripts and Static Files

### Name, Version, Description Standards

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "description": "A command-line tool for processing markdown files with customizable filters"
}
```

**Best Practices:**
- **name**: Use kebab-case, descriptive, unique on npm registry
- **version**: Follow Semantic Versioning (SemVer): MAJOR.MINOR.PATCH
- **description**: Clear, concise (under 80 characters), include primary use case

### Bin Field Configuration for Command-Line Tools

The `bin` field is crucial for CLI tools - it tells npm which files to link to the system path.

**Single Entry Point:**
```json
{
  "bin": "./bin/cli.js"
}
```

**Multiple Entry Points:**
```json
{
  "bin": {
    "mdsel": "./bin/cli.js",
    "markdown-selector": "./bin/cli.js",
    "md": "./bin/utils/md-helper.js"
  }
}
```

**CLI File Requirements:**
```bash
#!/usr/bin/env node
// Must include shebang for direct execution

const { program } = require('commander');

program
  .version('1.0.0')
  .description('Markdown selector CLI tool')
  .parse(process.argv);
```

### Files Array for Controlling What Gets Published

Explicitly control package contents to reduce bundle size and prevent accidental inclusion of development files.

```json
{
  "files": [
    "bin/",
    "lib/",
    "dist/",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

**Advanced Files Patterns:**
```json
{
  "files": [
    "bin/*.js",
    "lib/**/*.js",
    "dist/**/*.js",
    "templates/",
    "config/*.json",
    "!**/*.test.js",
    "!**/*.spec.js"
  ]
}
```

**Best Practices:**
- Be explicit about what to include
- Exclude test files, source maps, development tools
- Use negation patterns (`!`) to exclude specific files
- Include documentation files (README.md, LICENSE)

### Keywords for Discoverability

```json
{
  "keywords": [
    "cli",
    "command-line",
    "markdown",
    "filter",
    "selector",
    "text-processing",
    "productivity",
    "development",
    "shell-script",
    "bash",
    "zsh",
    "powershell"
  ]
}
```

**Keyword Strategy:**
- Include "cli" and "command-line"
- Add domain-specific terms (e.g., "markdown")
- Include tool categories (e.g., "productivity", "development")
- Consider shell compatibility terms

### Engines for Node Version Requirements

```json
{
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
```

**Alternative Approaches:**
```json
{
  "engines": {
    "node": ">=16.0.0"
  },
  "enginesStrict": true
}
```

**Best Practices:**
- Be conservative with minimum version requirements
- Include npm version if it has specific dependencies
- Consider using `enginesStrict` for critical dependencies

---

## 2. Scripts Configuration

### Postinstall Script Usage and Best Practices

```json
{
  "scripts": {
    "postinstall": "node scripts/setup.js"
  }
}
```

**When to Use postinstall:**
- Downloading external dependencies
- Setting up configuration files
- Generating files at install time
- Validating system requirements

**Alternatives to postinstall:**
```json
{
  "scripts": {
    "install": "node scripts/build-native.js",
    "preinstall": "node scripts/check-requirements.js"
  }
}
```

### prepublishOnly vs prepare vs postinstall

**Script Execution Order:**

1. **preinstall**: Runs before `npm install`
2. **install**: Runs during `npm install`
3. **postinstall**: Runs after `npm install`
4. **prepublish**: Runs before `npm publish`
5. **prepublishOnly**: Runs before `npm publish` (runs on publish, not prepublish)
6. **prepare**: Runs both before publish and after install
7. **postpublish**: Runs after `npm publish`

**Common Usage Patterns:**

```json
{
  "scripts": {
    "prepublishOnly": "npm run build",
    "prepare": "npm run build",
    "prepublish": "deprecated - use prepublishOnly",
    "postinstall": "npm run setup",
    "install": "npm run build-if-needed"
  }
}
```

**Best Practices:**
- Use `prepublishOnly` for build tasks before publishing
- Use `prepare` for build tasks needed both for development and distribution
- Use `postinstall` sparingly - it affects all installations
- Avoid heavy operations in `postinstall`

### When to Use Install Scripts (Controversial but Relevant for CLI Projects)

**Reasons to Use postinstall for CLI Tools:**
- Setting up shell completion scripts
- Generating default configuration
- Downloading binary assets
- Validating system requirements

**Alternatives to postinstall:**

1. **Build-time approach:**
```json
{
  "bin": "./dist/cli.js",
  "scripts": {
    "prepublishOnly": "npm run build",
    "build": "tsc"
  }
}
```

2. **Include pre-built binaries:**
```json
{
  "bin": {
    "cli": "./bin/cli-darwin",
    "cli.exe": "./bin/cli-windows.exe"
  }
}
```

3. **Lazy initialization:**
```json
{
  "bin": "./bin/cli.js",
  "scripts": {
    "cli": "node ./bin/cli.js --init-on-first-run"
  }
}
```

---

## 3. Metadata Fields

### Essential vs Recommended Fields

**Required by npm:**
```json
{
  "name": "package-name",
  "version": "1.0.0"
}
```

**Strongly Recommended:**
```json
{
  "description": "Brief description of the package",
  "main": "index.js",
  "scripts": {},
  "author": "Your Name <email@example.com>",
  "license": "MIT"
}
```

**Complete Metadata Example:**

```json
{
  "name": "mdsel",
  "version": "1.0.0",
  "description": "A command-line tool for selecting markdown content with intelligent filters",
  "main": "index.js",
  "bin": {
    "mdsel": "./bin/cli.js"
  },
  "scripts": {
    "start": "node bin/cli.js",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint .",
    "prepublishOnly": "npm run build"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/mdsel.git"
  },
  "homepage": "https://github.com/username/mdsel#readme",
  "bugs": {
    "url": "https://github.com/username/mdsel/issues"
  },
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "keywords": [
    "cli",
    "markdown",
    "filter",
    "command-line",
    "text-processing"
  ],
  "files": [
    "bin/",
    "lib/",
    "dist/",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### Field-Specific Best Practices

**Repository Field:**
```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/package.git",
    "directory": "packages/cli-tool"
  }
}
```

**Homepage Field:**
- Point to project documentation
- Should be user-friendly (not raw git URL)
- Example: "https://yourproject.com/docs"

**Bugs Field:**
```json
{
  "bugs": {
    "url": "https://github.com/username/package/issues",
    "email": "bugs@example.com"
  }
}
```

**License Field:**
- Use SPDX identifier: "MIT", "Apache-2.0", "GPL-3.0"
- Include LICENSE file in package
- Consider "UNLICENSED" for private packages

---

## 4. Package Distribution Patterns for CLI/Installer Packages

### Examples of Packages that Install Shell Scripts

**Pattern 1: Pre-built Binaries with Platform Detection**
```json
{
  "bin": {
    "tool": "./bin/tool-linux",
    "tool.exe": "./bin/tool-windows.exe",
    "tool-darwin": "./bin/tool-macos"
  },
  "os": [
    "darwin",
    "linux",
    "win32"
  ],
  "cpu": [
    "x64",
    "arm64"
  ]
}
```

**Pattern 2: Source Code with Build Step**
```json
{
  "bin": "./dist/cli.js",
  "scripts": {
    "prepublishOnly": "npm run build",
    "build": "pkg . --out-path dist/",
    "install": "node scripts/postinstall.js"
  },
  "files": [
    "dist/",
    "README.md",
    "LICENSE"
  ]
}
```

**Pattern 3: Node.js Native CLI**
```json
{
  "bin": "./bin/cli.js",
  "preferGlobal": true,
  "files": [
    "bin/",
    "lib/",
    "README.md"
  ],
  "scripts": {
    "postinstall": "node scripts/setup-shell-completion.js"
  }
}
```

### Files Array Patterns for Selective Publishing

**Minimal CLI Package:**
```json
{
  "files": [
    "bin/cli.js",
    "lib/",
    "README.md"
  ]
}
```

**Complete Distribution Package:**
```json
{
  "files": [
    "bin/",
    "lib/",
    "dist/",
    "templates/",
    "config/",
    "assets/",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "CONTRIBUTING.md"
  ]
}
```

**Package with Exclusions:**
```json
{
  "files": [
    "bin/*",
    "lib/*",
    "dist/*",
    "*.md",
    "*.json",
    "!package.json",
    "!package-lock.json",
    "!*.test.*",
    "!*.spec.*",
    "!coverage/",
    "!node_modules/",
    "!docs/",
    "!examples/"
  ]
}
```

### Distribution Strategies

**1. Global Installation Pattern:**
```json
{
  "preferGlobal": true,
  "bin": "./bin/cli.js",
  "files": [
    "bin/",
    "README.md"
  ]
}
```

**2. Local Usage Pattern:**
```json
{
  "bin": "./bin/cli.js",
  "files": [
    "bin/",
    "lib/",
    "package.json"
  ],
  "main": "./lib/index.js"
}
```

**3. Hybrid Approach:**
```json
{
  "bin": "./bin/cli.js",
  "main": "./lib/index.js",
  "files": [
    "bin/",
    "lib/",
    "dist/",
    "README.md"
  ]
}
```

---

## 5. Common Pitfalls and Gotchas

### Bin Field Issues

**❌ Wrong:**
```json
{
  "bin": "bin/cli.js"  // Relative to wrong directory
}
```

**✅ Right:**
```json
{
  "bin": "./bin/cli.js"
}
```

**❌ Wrong (no shebang):**
```javascript
// bin/cli.js
const program = require('commander');
// Missing shebang!
```

**✅ Right:**
```javascript
#!/usr/bin/env node
// bin/cli.js
const program = require('commander');
```

### Files Array Pitfalls

**❌ Including too much:**
```json
{
  "files": ["*"]  // Includes everything, including node_modules
}
```

**✅ Selective inclusion:**
```json
{
  "files": [
    "bin/",
    "lib/",
    "README.md"
  ]
}
```

### Script Timing Issues

**❌ Blocking postinstall:**
```json
{
  "postinstall": "npm install -g dependencies"  // Bad practice!
}
```

**✅ Non-blocking setup:**
```json
{
  "postinstall": "node scripts/setup.js --silent"
}
```

### Version Management

**❌ Inconsistent versions:**
```json
{
  "version": "1.0.0",
  "dependencies": {
    "tool": "^2.0.0"  // Major version jump
  }
}
```

**✅ Conservative approach:**
```json
{
  "version": "1.0.0",
  "dependencies": {
    "tool": "^1.0.0"  // Compatible versions
  }
}
```

### Publishing Issues

**❌ Missing files:**
- Forgetting to include `bin/` directory
- Not including compiled TypeScript files (`dist/`)
- Missing `README.md` or `LICENSE`

**✅ Checklist before publishing:**
- [ ] `bin` field points to correct files
- [ ] All files in `files` array exist
- [ ] Shebang is present in CLI entry points
- [ ] `test` script passes
- [ ] `prepublishOnly` script runs successfully
- [ ] Package size is reasonable (< 1MB for simple CLI tools)

### Security Considerations

**❌ Dangerous postinstall scripts:**
```json
{
  "postinstall": "npm install -g shady-package"
}
```

**✅ Safe alternatives:**
```json
{
  "scripts": {
    "setup": "node scripts/setup.js",
    "build": "tsc"
  }
}
```

---

## Additional Resources

### Official Documentation

- [npm package.json Documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [npm scripts Documentation](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [npm publishing Guidelines](https://docs.npmjs.com/cli/v9/publishing/)

### Recommended Reading

- [A guide to the perfect package.json](https://github.com/bkeepers/package.json)
- [How to create a Node.js CLI tool](https://itnext.io/how-to-create-a-node-js-cli-tool-9925ae488cd1)
- [npm best practices](https://docs.npmjs.com/misc/developers)

### Examples of Well-structured CLI Packages

- [npm CLI](https://github.com/npm/cli)
- [npx](https://github.com/npm/npx)
- [create-react-app](https://github.com/facebook/create-react-app)
- [Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite)

---

This document provides comprehensive guidance for creating effective package.json files for CLI tools and distribution packages. Always test your package installation process thoroughly before publishing to npm.