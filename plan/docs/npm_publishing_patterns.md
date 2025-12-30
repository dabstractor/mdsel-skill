# npm Package Publishing Best Practices

This research focuses on npm package publishing best practices, specifically for controlling package contents with the `files` array and optimizing package size for the mdsel-skill project.

## 1. The "files" Field in package.json

### How It Works

The `files` field in package.json is an array of file patterns that acts as a **whitelist**. Only files and directories matching these patterns will be included when the package is published to npm.

**Key characteristics:**
- **Whitelist approach**: Only explicitly listed files and directories are included
- **Pattern matching**: Supports wildcards (`*`, `**`) and directory paths
- **Inheritance**: If a directory is included, all its contents are included recursively
- **Automatic exclusions**: Some files are automatically excluded regardless of the `files` field

### Best Practices for File Patterns

```json
{
  "files": [
    "dist/",                    // Built output (recommended)
    "src/",                     // Source files (if publishing TypeScript)
    "lib/",                     // Compiled JavaScript
    "types/",                   // TypeScript declarations
    "bin/",                     // Binary/executable files
    "README.md",                // Main documentation
    "LICENSE",                  // License file
    "CHANGELOG.md",             // Version history
    "package.json"              // Package metadata
  ]
}
```

#### Recommended Patterns:

1. **Use forward slashes**: Always use `/` even on Windows
2. **Include trailing slash for directories**: `"dist/"` not `"dist"`
3. **Be specific**: Avoid `"*"` as it includes everything
4. **Group related files**: Keep similar patterns together

### Common Exclusions

The `files` field works in conjunction with npm's built-in exclusion rules:

**Automatically excluded:**
- `node_modules/`
- `.git/`
- `.npmignore` patterns
- `.gitignore` patterns (if no `.npmignore` exists)
- Hidden files (unless explicitly included)
- Build artifacts unless explicitly included

**Common manual exclusions:**
- Test files: `test/`, `__tests__/`, `*.test.js`, `*.spec.js`
- Development configs: `webpack.config.js`, `*.config.js`
- Documentation source: `docs/`, `*.md` (except main README)
- CI/CD files: `.github/`, `.travis.yml`, etc.

### Common Pitfalls

1. **Missing build artifacts**: Forgetting to include `dist/` when publishing compiled code
2. **Including too much**: Using `"*"` and including development files
3. **Path confusion**: Using backslashes on Windows instead of forward slashes
4. **Case sensitivity**: File patterns are case-sensitive
5. **Hidden files**: Not including `README.md`, `LICENSE`, or other important files

## 2. npm Publish Workflow

### Default Inclusion vs. Exclusion

**Default behavior (no `files` field):**
- Include all files not excluded by `.npmignore` or `.gitignore`
- This can accidentally include development files and bloat the package

**With `files` field:**
- Only include files matching patterns in the `files` array
- This gives precise control over what gets published

### Priority Order: .npmignore vs. files Field

1. **`files` field (highest priority)**: Acts as a whitelist - explicitly included files are ALWAYS published
2. **`.npmignore` patterns**: Blacklist - files matching these patterns are excluded
3. **`.gitignore` fallback**: If no `.npmignore` exists, npm uses `.gitignore` (with some npm-specific modifications)

**Important**: The `files` field overrides `.npmignore`. If a file is in the `files` array, it will be published even if it matches `.npmignore` patterns.

### Verifying What Will Be Published

Use `npm pack --dry-run` to see what files would be included in the published package:

```bash
# View what files would be packaged
npm pack --dry-run

# Create actual package file to inspect
npm pack
# This creates mdsel-skill-1.0.0.tgz
# You can extract and inspect its contents
```

Example output:
```
npm notice 📦  mdsel-skill@1.0.0
npm notice === Tarball Contents ===
npm notice 10.2kB  install.sh
npm notice 256B   .claude/skills/
npm notice 1.5kB  README.md
npm notice 1.8kB  hooks/claude/mdsel-reminder.sh
npm notice === Tarball Details ===
npm notice name:          mdsel-skill
npm notice version:       1.0.0
npm notice filename:      mdsel-skill-1.0.0.tgz
npm notice package size:  13.8 kB
npm notice unpacked size:  13.8 kB
npm notice shasum:        abc123...
npm notice integrity:     sha512-xyz...
npm notice total files:   5
```

## 3. Package Size Optimization

### Minimizing Published Package Size

1. **Exclude development dependencies**: Only include production dependencies in package.json
2. **Use `.npmignore` strategically**: Exclude build tools, test files, and development configs
3. **Ship compiled code**: For most npm packages, publish compiled JavaScript, not source
4. **Compress assets**: Use gzip compression for JSON files and similar content

### Excluding Development Files

Create a `.npmignore` file with these common patterns:

```
# Development dependencies
node_modules/
yarn.lock
package-lock.json
npm-shrinkwrap.json

# Build tools
webpack.config.js
rollup.config.js
babel.config.js
vite.config.js
*.config.js

# Testing
test/
__tests__/
*.test.js
*.spec.js
jest.config.js
ava.config.js

# Coverage
coverage/
.nyc_output/

# Environment variables
.env
.env.local
.env.*.local

# IDE and editor
.vscode/
.idea/
*.swp
*.swo
*.sublime-*

# OS
.DS_Store
Thumbs.db

# Build artifacts
dist/
build/
out/
```

### Handling Git Dependencies

Git dependencies (using `git+https://` URLs) are problematic because:
1. They increase package size significantly
2. They reference external repositories
3. They can break if the repository is private or moved

**Solutions:**
1. **Use npm registry**: Publish dependencies to npm
2. **Bundle git dependencies**: Use tools like `npm-pack` or `git-submodule` for internal dependencies
3. **Document manual installation**: For development dependencies
4. **Use monorepo structure**: For closely related packages

## 4. mdsel-skill Specific Packaging Guidance

### Current Package Structure

The current `package.json` includes:
```json
{
  "files": [
    "install.sh",
    ".claude/",
    "hooks/",
    "README.md"
  ]
}
```

### Analysis and Recommendations

#### What's Currently Included:

1. **`install.sh`** ✅
   - Good: This is the main executable for the skill
   - Should be included

2. **`.claude/`** ✅
   - Good: Contains skill definitions
   - Currently has `skills/` subdirectory

3. **`hooks/`** ✅
   - Good: Contains hook scripts
   - Has `claude/` and `opencode/` subdirectories
   - `opencode/` has its own `node_modules/` and build artifacts

4. **`README.md`** ✅
   - Good: Essential documentation

#### Issues to Address:

1. **`hooks/opencode/node_modules/`** ❌
   - Currently included due to `hooks/` pattern
   - Should be excluded - large and unnecessary

2. **Build artifacts in `hooks/opencode/`** ❌
   - `dist/` directory may be included
   - Should exclude development files

3. **Size optimization** ⚠️
   - Package might be larger than necessary
   - Consider pre-built vs source distribution

### Recommended .npmignore File

Create `.npmignore` in the project root:

```
# Development dependencies
node_modules/
hooks/opencode/node_modules/

# Build artifacts
dist/
build/
*.log

# Environment
.env
.env.*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Documentation
docs/
*.md

# Temporary files
*.tmp
*.temp
~
```

### Optimized files Field

Option 1: (Current structure with exclusions handled by .npmignore)

```json
{
  "files": [
    "install.sh",
    ".claude/",
    "hooks/",
    "README.md"
  ]
}
```

Option 2: (More explicit - recommended for better control)

```json
{
  "files": [
    "install.sh",
    ".claude/skills/",
    "hooks/claude/mdsel-reminder.sh",
    "README.md",
    "LICENSE"
  ]
}
```

**Recommendation**: Use Option 2 for better control over exactly what gets published.

### Packaging Strategy

1. **Pre-built distribution**: Publish compiled files only
2. **Separate development and production**: Exclude all development files
3. **Use npm hooks**: Run postinstall script automatically
4. **Clear documentation**: Document installation and usage

### Verification Steps

After making changes:

```bash
# 1. Check what would be published
npm pack --dry-run

# 2. Create and inspect package
npm pack
tar -tzf mdsel-skill-*.tgz

# 3. Publish to npm (after testing)
npm publish
```

## 5. Additional Resources

### Official Documentation

- [npm package.json documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files)
- [npm publishing guide](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [npm ignore files](https://docs.npmjs.com/cli/v10/configuring-npm/npmignore)

### Advanced Topics

1. **Monorepo publishing**: Using `workspaces` and selective publishing
2. **Publishing private packages**: Using `npm config set registry`
3. **Semantic versioning**: Following semver for version updates
4. **Continuous publishing**: Automating with CI/CD pipelines

### Package Analytics

- [npm Trends](https://www.npmtrends.com/)
- [Libraries.io](https://libraries.io/)
- [Packagephobia](https://packagephobia.com/) - analyze package sizes

---

*Last updated: December 30, 2025*
*This research document provides actionable guidance for npm package publishing, specifically tailored for the mdsel-skill project.*