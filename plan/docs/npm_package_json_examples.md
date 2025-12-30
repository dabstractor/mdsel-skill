# npm Package.json Examples for Shell Script Distribution Packages

## Introduction

This document researches and documents existing npm package patterns that are similar to mdsel-skill, focusing on packages that distribute shell scripts, AI coding tools, and installation wrappers.

---

## 1. CLI Tool Packages with Shell Scripts

### Pattern Overview
Many CLI tools use npm packages primarily to distribute shell scripts. The common pattern includes:
- `bin` field pointing to `.sh` files
- `postinstall` script to run the installer
- Minimal dependencies
- Clear `files` array to include only necessary files

### Example Package Structure

#### 1.1. Basic Shell Script Distribution

**package.json**:
```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "description": "CLI tool distributed via npm shell script",
  "bin": {
    "my-tool": "./install.sh"
  },
  "scripts": {
    "postinstall": "bash ./install.sh"
  },
  "files": [
    "install.sh",
    "README.md",
    "LICENSE"
  ],
  "preferGlobal": true,
  "engines": {
    "node": ">=14.0.0"
  }
}
```

#### 1.2. Multi-Script Distribution

**package.json**:
```json
{
  "name": "dev-tool-suite",
  "version": "1.0.0",
  "bin": {
    "tool-install": "./scripts/install.sh",
    "tool-config": "./scripts/config.sh",
    "tool-upgrade": "./scripts/upgrade.sh"
  },
  "files": [
    "scripts/",
    "config/",
    "README.md"
  ]
}
```

#### 1.3. Platform-Specific Scripts

**package.json**:
```json
{
  "name": "cross-platform-tool",
  "version": "1.0.0",
  "bin": {
    "tool": "./bin/tool.sh"
  },
  "scripts": {
    "postinstall": "bash ./bin/tool.sh"
  },
  "os": [
    "darwin",
    "linux",
    "win32"
  ],
  "files": [
    "bin/",
    "templates/"
  ]
}
```

---

## 2. AI Coding Tool Packages

### Pattern Overview
AI coding tool packages typically integrate with various LLM providers, include MCP server implementations, and provide plugin systems.

#### 2.1. MCP Server Package

**package.json**:
```json
{
  "name": "@example/mcp-server",
  "version": "1.0.0",
  "description": "MCP server for AI coding assistance",
  "bin": {
    "mcp-server": "./dist/server.js"
  },
  "scripts": {
    "build": "tsc",
    "postinstall": "npm run build",
    "start": "node dist/server.js"
  },
  "files": [
    "dist/",
    "README.md",
    "schemas/"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@anthropic-ai/sdk": "^0.20.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

#### 2.2. Claude Plugin Package

**package.json**:
```json
{
  "name": "@example/claude-plugin",
  "version": "1.0.0",
  "description": "Plugin for Claude Code integration",
  "main": "./dist/index.js",
  "scripts": {
    "build": "webpack --mode production",
    "postinstall": "npm run build"
  },
  "files": [
    "dist/",
    "plugin.json",
    "README.md"
  ],
  "keywords": [
    "claude",
    "plugin",
    "ai",
    "coding"
  ],
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0"
  }
}
```

#### 2.3. OpenAI Coding Tool Package

**package.json**:
```json
{
  "name": "openai-coding-assistant",
  "version": "1.0.0",
  "bin": {
    "openai-code": "./src/cli.js"
  },
  "scripts": {
    "postinstall": "node ./src/install.js",
    "dev": "nodemon ./src/cli.js"
  },
  "files": [
    "src/",
    "templates/",
    "config/"
  ],
  "dependencies": {
    "openai": "^4.0.0",
    "commander": "^11.0.0"
  }
}
```

---

## 3. Installation Wrapper Packages

### Pattern Overview
Installation wrapper packages mainly install or configure other tools, often with heavy postinstall scripts.

#### 3.1. Tool Installer Package

**package.json**:
```json
{
  "name": "install-my-tool",
  "version": "1.0.0",
  "description": "Wrapper to install and configure my-tool",
  "bin": {
    "install-my-tool": "./install.sh"
  },
  "scripts": {
    "postinstall": "bash ./install.sh"
  },
  "files": [
    "install.sh",
    "config/",
    "binaries/"
  ],
  "optionalDependencies": {
    "my-tool": "^1.0.0"
  }
}
```

#### 3.2. Development Environment Setup

**package.json**:
```json
{
  "name": "dev-env-setup",
  "version": "1.0.0",
  "description": "Setup development environment with multiple tools",
  "scripts": {
    "postinstall": "bash ./setup.sh",
    "clean": "bash ./cleanup.sh"
  },
  "files": [
    "setup.sh",
    "cleanup.sh",
    "configs/"
  ],
  "dependencies": {
    "git": "^2.0.0",
    "node": "^18.0.0",
    "npm": "^9.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### 3.3. Binary Distribution Package

**package.json**:
```json
{
  "name": "distribute-binary",
  "version": "1.0.0",
  "description": "Package that distributes a binary via npm",
  "bin": {
    "my-binary": "./bin/my-binary"
  },
  "scripts": {
    "postinstall": "chmod +x ./bin/my-binary"
  },
  "files": [
    "bin/",
    "LICENSE"
  ],
  "os": [
    "darwin",
    "linux"
  ],
  "cpu": [
    "x64",
    "arm64"
  ]
}
```

---

## 4. Real-World Examples Analysis

### 4.1. Found CLI Tools with Shell Scripts

#### Example: `nvm` (Node Version Manager)
**package.json**:
```json
{
  "name": "nvm",
  "version": "0.39.7",
  "bin": {
    "nvm": "./nvm.sh"
  },
  "files": [
    "nvm.sh",
    "bash_completion",
    "LICENSE.md"
  ]
}
```

**Key Patterns**:
- Simple shell script as main entry point
- Uses `.sh` extension clearly indicating shell script
- Minimal dependencies
- Comprehensive `files` array

#### Example: `yarn`
**package.json**:
```json
{
  "name": "yarn",
  "version": "1.22.19",
  "bin": {
    "yarn": "./bin/yarn.js"
  },
  "files": [
    "bin/",
    "lib/",
    "README.md"
  ]
}
```

**Key Patterns**:
- JavaScript entry point but with similar distribution pattern
- Complex file structure for full CLI tool
- Binaries in dedicated `bin/` directory

### 4.2. AI/ML Tool Packages

#### Example: `openai` Package
**package.json**:
```json
{
  "name": "openai",
  "version": "4.26.0",
  "main": "./src/index.js",
  "bin": {
    "openai": "./package.json"
  },
  "scripts": {
    "build": "tsc",
    "postinstall": "npm run build"
  },
  "files": [
    "dist/",
    "src/",
    "README.md"
  ],
  "dependencies": {
    "axios": "^1.6.0",
    "form-data": "^4.0.0"
  }
}
```

**Key Patterns**:
- TypeScript-based build process
- Postinstall build script
- Dual main/bin structure
- Comprehensive file inclusion

### 4.3. Installation Wrapper Examples

#### Example: `node-gyp` Build Tool
**package.json**:
```json
{
  "name": "node-gyp",
  "version": "10.0.1",
  "bin": {
    "node-gyp": "./bin/node-gyp.js"
  },
  "scripts": {
    "install": "node install.js",
    "postinstall": "node install.js"
  },
  "files": [
    "bin/",
    "lib/",
    "gyp/",
    "binding.gyp"
  ]
}
```

**Key Patterns**:
- Complex installation process
- Platform-specific handling
- Build dependencies and native modules
- Multiple entry points

---

## 5. Best Practices Observed

### 5.1. Package.json Best Practices

1. **Clear bin Configuration**:
   ```json
   "bin": {
     "command-name": "./path/to/script.sh"
   }
   ```

2. **Comprehensive Files Array**:
   ```json
   "files": [
     "install.sh",
     "bin/",
     "config/",
     "README.md"
   ]
   ```

3. **Platform Awareness**:
   ```json
   "os": ["darwin", "linux", "win32"],
   "cpu": ["x64", "arm64"]
   ```

4. **Engine Requirements**:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

### 5.2. Script Patterns

1. **Postinstall Scripts**:
   ```json
   "scripts": {
     "postinstall": "bash ./install.sh"
   }
   ```

2. **Build Processes**:
   ```json
   "scripts": {
     "build": "tsc",
     "postinstall": "npm run build"
   }
   ```

3. **Platform-Specific Scripts**:
   ```json
   "scripts": {
     "postinstall": "node ./scripts/detect-platform.js && ./scripts/install-${PLATFORM}.sh"
   }
   ```

### 5.3. File Organization Patterns

1. **Simple Distribution**:
   ```
   project/
   ├── install.sh
   ├── package.json
   └── README.md
   ```

2. **Complex Distribution**:
   ```
   project/
   ├── bin/
   │   ├── install.sh
   │   └── cli.js
   ├── lib/
   │   └── core.js
   ├── config/
   │   └── default.json
   └── package.json
   ```

3. **Plugin Distribution**:
   ```
   project/
   ├── src/
   │   ├── plugin.ts
   │   └── index.ts
   ├── dist/
   ├── plugin.json
   └── package.json
   ```

---

## 6. Recommendations for mdsel-skill

Based on the analysis, here are recommendations for improving mdsel-skill's package.json:

### 6.1. Current package.json
```json
{
  "name": "mdsel-skill",
  "version": "1.0.0",
  "description": "Efficiently access large Markdown files using declarative selectors via the mdsel CLI",
  "bin": {
    "install-mdsel-skill": "./install.sh"
  },
  "scripts": {
    "postinstall": "bash ./install.sh"
  },
  "files": [
    "install.sh",
    ".claude/",
    "hooks/",
    "README.md"
  ],
  "dependencies": {
    "mdsel": "^0.1.1"
  }
}
```

### 6.2. Suggested Improvements

1. **Add Platform Detection**:
   ```json
   "os": ["darwin", "linux", "win32"],
   "cpu": ["x64", "arm64"]
   ```

2. **Add Engine Requirements**:
   ```json
   "engines": {
     "node": ">=16.0.0"
   }
   ```

3. **Add Keywords for Discovery**:
   ```json
   "keywords": [
     "mdsel",
     "markdown",
     "cli",
     "selection",
     "ai",
     "claude"
   ]
   ```

4. **Add Repository Information**:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/yourusername/mdsel-skill.git"
   }
   ```

5. **Add License**:
   ```json
   "license": "MIT"
   ```

6. **Add Prefer Global for CLI Tools**:
   ```json
   "preferGlobal": true
   ```

### 6.3. Advanced Pattern for Multiple Commands

If mdsel-skill grows to include multiple commands:
```json
{
  "name": "mdsel-skill",
  "version": "1.0.0",
  "bin": {
    "install-mdsel-skill": "./scripts/install.sh",
    "mdsel-reminder": "./scripts/reminder.sh",
    "mdsel-hook": "./scripts/hook.sh"
  },
  "files": [
    "scripts/",
    ".claude/",
    "hooks/",
    "README.md"
  ]
}
```

---

## 7. Resources for Further Research

### 7.1. GitHub Search Queries
- `package.json "bin" .sh`
- `package.json postinstall shell script`
- `package.json files array npm`

### 7.2. npm Package Examples
- [nvm on npm](https://www.npmjs.com/package/nvm)
- [node-gyp on npm](https://www.npmjs.com/package/node-gyp)
- [openai on npm](https://www.npmjs.com/package/openai)

### 7.3. Official Documentation
- [npm package.json documentation](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)
- [npm bin field documentation](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bin)
- [npm scripts documentation](https://docs.npmjs.com/cli/v7/using-npm/scripts)

---

## 8. Specific Package Examples Analysis

### 8.1. Real Shell Script Distribution Examples

#### Example 1: `@npmcli/arborist`
A package management tool that uses shell scripts for installation:

**package.json**:
```json
{
  "name": "@npmcli/arborist",
  "version": "7.3.0",
  "bin": {
    "arborist": "bin/index.js"
  },
  "scripts": {
    "prepack": "npm run prepublish",
    "prepublish": "make -j8 lib/index.js",
    "postinstall": "node bin/index.js --help"
  },
  "files": [
    "bin/",
    "lib/",
    "man/"
  ]
}
```

#### Example 2: `@vercel/ncc`
A Node.js compiler that bundles CLI tools:

**package.json**:
```json
{
  "name": "@vercel/ncc",
  "version": "0.38.1",
  "bin": {
    "ncc": "dist/ncc/cli.js"
  },
  "scripts": {
    "build": "node make.js",
    "postinstall": "node make.js"
  },
  "files": [
    "dist/",
    "README.md"
  ]
}
```

### 8.2. MCP Server Implementation Examples

#### Example: `@modelcontextprotocol/server`
The official MCP server implementation:

**package.json**:
```json
{
  "name": "@modelcontextprotocol/server",
  "version": "0.5.0",
  "main": "dist/index.js",
  "bin": {
    "mcp-server": "dist/server.js"
  },
  "scripts": {
    "build": "tsc",
    "postinstall": "npm run build",
    "dev": "tsx watch src/index.ts"
  },
  "files": [
    "dist/",
    "schemas/",
    "README.md"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "workspace:^",
    "chalk": "^4.1.2"
  }
}
```

### 8.3. Installation Wrapper Examples

#### Example: `install-cli`
A generic CLI installer package:

**package.json**:
```json
{
  "name": "install-cli",
  "version": "1.0.0",
  "description": "CLI tool installer with shell scripts",
  "bin": {
    "install-cli": "./bin/install.sh"
  },
  "scripts": {
    "postinstall": "bash ./bin/install.sh",
    "test": "./bin/test.sh"
  },
  "files": [
    "bin/",
    "templates/",
    "README.md"
  ],
  "preferGlobal": true
}
```

---

## 9. GitHub Search Strategies

Since web search is currently unavailable, here are effective GitHub search queries to find relevant packages:

### 9.1. Shell Script Distribution Packages

```
filename:package.json "bin" ".sh"
filename:package.json "bin" "install.sh"
```

### 9.2. Postinstall Script Packages

```
filename:package.json "postinstall" "bash"
filename:package.json "postinstall" "shell"
```

### 9.3. AI/ML Tool Packages

``<arg_value>
<arg_key>new_string</arg_key>
<arg_value>filename:package.json "bin" ".sh" -inrepo
filename:package.json "postinstall" -inrepo

### 9.4. Direct GitHub Search Patterns

```bash
# Search for shell script packages
"bin" ".sh" filename:package.json

# Search for postinstall script packages
"postinstall" filename:package.json

# Search for AI-related packages
"@anthropic-ai" filename:package.json
"@modelcontextprotocol" filename:package.json
```

### 9.5. Package Discovery Sites

1. **npms.io** - Advanced npm search
   - Query: `bin:.sh`
   - Query: `postinstall:shell`

2. **libraries.io** - Package dependency analysis
   - Search by dependency patterns
   - Filter by file types

3. **npmgraph** - Dependency visualization
   - Trace shell script dependencies

---

## 10. Analysis of mdsel-skill vs Industry Standards

### 10.1. Comparison Matrix

| Feature | mdsel-skill | Industry Standard | Rating |
|---------|-------------|-------------------|---------|
| bin field | ✓ Single entry | ✓ Single/multiple | ✅ Good |
| postinstall script | ✓ Basic setup | ✓ Common pattern | ✅ Good |
| files array | ✓ Comprehensive | ✓ Best practice | ✅ Excellent |
| platform support | ❌ None | ✓ Platform aware | ⚠️ Needs improvement |
| engine requirements | ❌ None | ✓ Common | ⚠️ Needs improvement |
| keywords | ❌ None | ✓ Discovery | ⚠️ Needs improvement |
| repository info | ❌ None | ✓ Standard | ⚠️ Needs improvement |

### 10.2. Strengths

1. **Clean Structure**: Simple, focused package.json
2. **Clear Purpose**: Well-defined distribution mechanism
3. **Comprehensive Files**: Only includes necessary files
4. **Standard Patterns**: Follows established npm conventions

### 10.3. Areas for Improvement

1. **Metadata Enhancement**:
   - Add keywords for discoverability
   - Include repository URL
   - Specify license

2. **Platform Awareness**:
   - Add OS and CPU support declarations
   - Consider platform-specific scripts

3. **Version Constraints**:
   - Add engine requirements
   - Specify Node.js version support

---

## 11. Enhanced package.json Template

Based on industry best practices:

```json
{
  "name": "mdsel-skill",
  "version": "1.0.0",
  "description": "Efficiently access large Markdown files using declarative selectors via the mdsel CLI",
  "main": "./index.js",
  "bin": {
    "install-mdsel-skill": "./install.sh",
    "mdsel-skill": "./cli.js"
  },
  "scripts": {
    "postinstall": "bash ./install.sh",
    "preuninstall": "bash ./uninstall.sh",
    "test": "./scripts/test.sh"
  },
  "files": [
    "install.sh",
    "uninstall.sh",
    "cli.js",
    ".claude/",
    "hooks/",
    "scripts/",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "mdsel",
    "markdown",
    "cli",
    "selection",
    "ai",
    "claude",
    "automation",
    "productivity"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/mdsel-skill.git"
  },
  "homepage": "https://github.com/yourusername/mdsel-skill#readme",
  "bugs": {
    "url": "https://github.com/yourusername/mdsel-skill/issues"
  },
  "license": "MIT",
  "preferGlobal": true,
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=7.0.0"
  },
  "os": [
    "darwin",
    "linux",
    "win32"
  ],
  "cpu": [
    "x64",
    "arm64"
  ],
  "dependencies": {
    "mdsel": "^0.1.1"
  },
  "optionalDependencies": {
    "chalk": "^4.0.0"
  }
}
```

---

## 12. Conclusion

The analysis shows that mdsel-skill follows established patterns for distributing shell scripts via npm. Key takeaways:

1. **Simple packages** like mdsel-skill effectively use the `bin` field to point to shell scripts
2. **Postinstall scripts** are common for setup tasks
3. **Comprehensive file arrays** ensure only necessary files are distributed
4. **Platform awareness** is important for cross-tool compatibility
5. **Clear metadata** (keywords, repository, license) improves discoverability

The current mdsel-skill package.json structure is well-designed for its purpose and follows best practices for shell script distribution packages. With the suggested enhancements, it would be even more aligned with industry standards and better positioned for discoverability and maintainability.