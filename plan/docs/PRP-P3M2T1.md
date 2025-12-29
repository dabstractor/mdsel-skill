# PRP: P3.M2.T1 - Finalize Package Configuration

---

## Goal

**Feature Goal**: Complete package.json with all required npm publication metadata and verify npx execution compatibility.

**Deliverable**: An updated package.json file containing all necessary npm metadata (repository, homepage, bugs, keywords, author, license) and verified npx execution capability.

**Success Definition**:
- package.json includes all recommended npm metadata fields for publication
- The package can be executed via `npx mdsel-claude` without global installation
- All metadata is valid and follows npm best practices
- The package is ready for npm publication

---

## All Needed Context

### Context Completeness Check

_Before proceeding, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

Yes - this PRP provides:
- Exact package.json structure with all required and recommended fields
- Real MCP server package.json examples from published packages
- Specific URLs to npm documentation for each metadata field
- Verification commands for npx execution testing
- Repository URL patterns and naming conventions
- Complete list of files to include in the published package

### Documentation & References

```yaml
# CRITICAL INTERNAL DOCUMENTATION - Read before implementing
- file: package.json
  why: Current package state - base to modify
  critical: Lines 2-22 contain existing configuration to preserve

- file: PRD.md
  why: Project requirements for distribution
  section: Section 3.2 - specifies "npx mdsel-mcp" execution requirement

- file: tsup.config.ts
  why: Build configuration that produces executable bundle
  critical: Line 12 adds shebang "#!/usr/bin/env node" to dist/index.js

- file: dist/index.js
  why: Verify shebang exists for npx compatibility
  pattern: First line should be "#!/usr/bin/env node"

- file: hooks/PreToolUse.d/mdsel-reminder.sh
  why: Hook script to include in published package
  critical: Must be included in files field for distribution

# EXTERNAL RESEARCH - npm Package Metadata Best Practices
- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
  why: Official npm package.json documentation
  critical: Required vs recommended fields, format specifications

- url: https://docs.npmjs.com/about-publishing-npm-packages
  why: npm publishing best practices
  section: "Preparing your package for publication"

- url: https://semver.org/
  why: Semantic versioning specification
  critical: Version field format (MAJOR.MINOR.PATCH)

# REAL MCP SERVER EXAMPLES - Reference for patterns
- url: https://github.com/modelcontextprotocol/servers
  why: Official MCP servers - reference for package.json patterns
  critical: @modelcontextprotocol/server-sequential-thinking structure

- url: https://github.com/cameroncooke/XcodeBuildMCP
  why: Real-world MCP server with complete package metadata
  critical: Keywords, repository, bugs, homepage patterns

# NPX EXECUTION REQUIREMENTS
- url: https://docs.npmjs.com/cli/v10/commands/npx
  why: npx documentation and requirements
  critical: bin field format, shebang requirements

- url: https://nodejs.org/api/packages.html
  why: Node.js package documentation
  section: "Binaries"
```

### Current Codebase Tree

```bash
mdsel-claude-attempt-2/
├── coverage/                  # Test coverage (not published)
├── dist/                      # Built output (published)
│   ├── index.js               # Main entry point with shebang
│   ├── index.d.ts             # TypeScript definitions
│   ├── executor.js
│   ├── executor.d.ts
│   ├── tools/
│   └── utils/
├── hooks/                     # Hook scripts (should be published)
│   └── PreToolUse.d/
│       └── mdsel-reminder.sh
├── node_modules/              # Not published
├── plan/                      # Internal planning (not published)
├── src/                       # Source files (not published - dist/ is used)
├── .gitignore
├── package.json               # TO BE MODIFIED - This task's deliverable
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── PRD.md
├── README.md                  # Should be published
└── tasks.json
```

### Desired Codebase Tree (After Implementation)

```bash
# No new files added - only package.json is modified
# The files field will control what gets published
```

### Current package.json State (Reference)

```json
{
  "name": "mdsel-claude",
  "version": "1.0.0",
  "description": "Claude Code adapter with behavioral enforcement for selector-based Markdown access",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "mdsel-claude": "./dist/index.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "tsup --watch",
    "prepack": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "zod": "^3.24.0"
  },
  "peerDependencies": {
    "mdsel": "^1.0.0"
  },
  "peerDependenciesMeta": {
    "mdsel": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@vitest/coverage-v8": "^2.1.8",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

### Known Gotchas of Our Codebase & Library Quirks

```json
// CRITICAL: package.json publication gotchas

// 1. files field MUST include hooks/ directory
// Gotcha: Current files field only includes "dist" - hooks will be excluded
// Solution: Add "README.md", "LICENSE", "hooks" to files array

// 2. Shebang is added by tsup banner, not in source
// Location: tsup.config.ts line 12 - banner.js adds "#!/usr/bin/env node"
// Gotcha: If checking for shebang, look in dist/index.js not src/index.ts

// 3. mdsel is an optional PEER dependency
// Gotcha: Users must install mdsel separately - this is intentional
// Solution: Keep peerDependenciesMeta.optional = true

// 4. Package name differs from PRD naming
// PRD uses: "mdsel-mcp"
// package.json uses: "mdsel-claude"
// Gotcha: npx command uses package.json name: "npx mdsel-claude"
// Decision: Keep "mdsel-claude" - name is already established

// 5. No LICENSE file exists yet
// Gotcha: README mentions "MIT" but no LICENSE file
// Solution: Add "license": "MIT" field, create LICENSE file if needed

// 6. Repository URLs should use git+https format
// Gotcha: npm prefers "git+https://github.com/user/repo.git" format
// Solution: Use proper git+https URL in repository field

// 7. prepack script builds automatically
// Gotcha: "npm publish" triggers prepack which triggers build
// Benefit: Ensures fresh build on publish, no stale dist files

// 8. MCP-specific naming convention
// Some MCP servers use "mcpName" field
// Gotcha: Not required by npm, but used by MCP ecosystem tools
// Decision: Add mcpName following official MCP server pattern
```

---

## Implementation Blueprint

### Data Models and Structure

This task modifies an existing JSON configuration file (package.json). No new data models are created.

**Modified Structure**:
```json
{
  // Existing fields preserved...
  // NEW FIELDS TO ADD:
  "homepage": "string URL",
  "repository": { "type": "git", "url": "string" },
  "bugs": { "url": "string" },
  "keywords": ["array", "of", "strings"],
  "author": "string or object",
  "license": "SPDX identifier",
  "mcpName": "MCP-specific identifier"
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: UPDATE files field to include distribution assets
  - MODIFY: package.json files array (line 17-19)
  - ADD: "README.md", "hooks" to the files array
  - CURRENT: ["dist"]
  - NEW: ["dist", "README.md", "hooks"]
  - REASON: Hooks are user-facing feature documented in README
  - REFERENCE: README.md lines 189-201 (hook installation instructions)

Task 2: ADD homepage field
  - ADD: "homepage" field at package.json root
  - VALUE: "https://github.com/dustinswords/mdsel-claude" (update with actual repo)
  - FORMAT: Single string URL
  - PLACEMENT: After "description" field (around line 5)
  - REFERENCE: npm docs https://docs.npmjs.com/cli/v10/configuring-npm/package-json#homepage

Task 3: ADD repository field
  - ADD: "repository" object at package.json root
  - STRUCTURE:
    {
      "type": "git",
      "url": "git+https://github.com/dustinswords/mdsel-claude.git"
    }
  - PLACEMENT: After "homepage" field
  - FORMAT: Use git+https:// protocol for npm compatibility
  - GOTCHA: Update username "dustinswords" to actual repository owner
  - REFERENCE: npm docs https://docs.npmjs.com/cli/v10/configuring-npm/package-json#repository

Task 4: ADD bugs field
  - ADD: "bugs" object at package.json root
  - STRUCTURE:
    {
      "url": "https://github.com/dustinswords/mdsel-claude/issues"
    }
  - PLACEMENT: After "repository" field
  - REFERENCE: npm docs https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bugs

Task 5: ADD keywords field
  - ADD: "keywords" array at package.json root
  - VALUES:
    [
      "mcp",
      "modelcontextprotocol",
      "mdsel",
      "markdown",
      "selector",
      "claude",
      "claude-code",
      "cli"
    ]
  - PLACEMENT: After "description" field
  - PURPOSE: npm search discoverability
  - REFERENCE: Real MCP servers use similar keywords (e.g., XcodeBuildMCP)

Task 6: ADD author field
  - ADD: "author" field at package.json root
  - FORMAT: "Your Name <email@example.com> (https://yourwebsite.com)"
  - OR FORMAT: Just name as string: "Your Name"
  - PLACEMENT: After "keywords" field
  - GOTCHA: Use actual author info - placeholder should be updated
  - REFERENCE: npm docs https://docs.npmjs.com/cli/v10/configuring-npm/package-json#people-fields-author

Task 7: ADD license field
  - ADD: "license" field at package.json root
  - VALUE: "MIT"
  - PLACEMENT: Near end of package.json (before "dependencies" or after "author")
  - NOTE: README.md line 225 already states "MIT" - match this
  - OPTIONAL: Create LICENSE file in project root with MIT text
  - REFERENCE: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#license

Task 8: ADD mcpName field (MCP-specific)
  - ADD: "mcpName" field at package.json root
  - VALUE: "io.github.dustinswords/mdsel-claude"
  - FORMAT: Reverse domain notation following MCP convention
  - PLACEMENT: After "license" field
  - OPTIONAL: Used by MCP ecosystem tools
  - REFERENCE: Official MCP servers use this pattern (server-sequential-thinking)

Task 9: VERIFY shebang in built output
  - CHECK: dist/index.js first line contains "#!/usr/bin/env node"
  - COMMAND: head -1 dist/index.js
  - EXPECTED: "#!/usr/bin/env node"
  - IF MISSING: Verify tsup.config.ts banner configuration (line 11-13)
  - REFERENCE: tsup.config.ts line 12 adds shebang via banner

Task 10: VERIFY npx execution locally
  - BUILD: npm run build (to ensure fresh dist/)
  - TEST: npx mdsel-claude --help (if help option supported)
  - OR TEST: npx mdsel-claude (should start MCP server on stdio)
  - EXPECTED: Server starts without errors
  - GOTCHA: npx will download and run the local package if not published
  - REFERENCE: PRD Section 3.2 requires "npx mdsel-mcp" execution

Task 11: VALIDATE package.json syntax
  - COMMAND: cat package.json | jq . > /dev/null
  - EXPECTED: No JSON syntax errors
  - ALTERNATIVE: npm pack --dry-run (shows what would be published)
  - VERIFIES: All fields are properly formatted

Task 12: CREATE LICENSE file (optional but recommended)
  - CREATE: LICENSE file at project root
  - CONTENT: Standard MIT license text
  - TEMPLATE: Use https://opensource.org/licenses/MIT
  - ADD: Update files array to include "LICENSE"
  - PLACEHOLDER: "[year] [Copyright Holder Name]"
```

### Implementation Patterns & Key Details

```json
// REAL MCP SERVER PACKAGE.JSON PATTERNS TO FOLLOW

// Pattern 1: Metadata field ordering (conventional order)
{
  "name": "...",
  "version": "...",
  "description": "...",
  "homepage": "...",        // NEW - add here
  "repository": {...},       // NEW - add here
  "bugs": {...},             // NEW - add here
  "keywords": [...],         // NEW - add here
  "author": "...",           // NEW - add here
  "license": "...",          // NEW - add here
  "type": "...",
  "main": "...",
  // ... rest of fields
}

// Pattern 2: Repository URL format (npm prefers git+https)
"repository": {
  "type": "git",
  "url": "git+https://github.com/username/repo.git"
}

// Pattern 3: Keywords for discoverability
"keywords": [
  "mcp",                    // MCP servers
  "modelcontextprotocol",    // Alternative name
  "mdsel",                   // Core functionality
  "markdown",               // Document type
  "selector",               // Selection mechanism
  "claude",                 // Target AI
  "cli"                     // CLI wrapper
]

// Pattern 4: Files array - what to publish
"files": [
  "dist",         // Built JavaScript (required)
  "README.md",    // Documentation (required for npm)
  "LICENSE",      // License file (recommended)
  "hooks"         // Hook scripts (project-specific)
]
// NOTE: Excludes: src/, tests/, plan/, node_modules/, config files

// Pattern 5: MCP-specific naming
"mcpName": "io.github.username/package-name"
// Format: reverse domain + package name
// Used by: MCP inspector and discovery tools
```

### Real MCP Server Examples

```json
// EXAMPLE 1: @modelcontextprotocol/server-sequential-thinking (Official)
{
  "name": "@modelcontextprotocol/server-sequential-thinking",
  "version": "2025.12.18",
  "description": "MCP server for sequential thinking and problem solving",
  "author": "Anthropic, PBC (https://anthropic.com)",
  "license": "MIT",
  "homepage": "https://modelcontextprotocol.io",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/modelcontextprotocol/servers.git"
  },
  "bugs": {
    "url": "https://github.com/modelcontextprotocol/servers/issues"
  },
  "mcpName": "io.github.modelcontextprotocol/server-sequential-thinking"
}

// EXAMPLE 2: xcodebuildmcp (Community)
{
  "name": "xcodebuildmcp",
  "version": "1.15.1",
  "description": "XcodeBuildMCP is a ModelContextProtocol server...",
  "keywords": [
    "xcodebuild",
    "mcp",
    "modelcontextprotocol",
    "xcode",
    "ios"
  ],
  "author": "Cameron Cooke",
  "license": "MIT",
  "homepage": "https://www.async-let.com/blog/xcodebuild-mcp/",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/cameroncooke/XcodeBuildMCP.git"
  },
  "bugs": {
    "url": "https://github.com/cameroncooke/XcodeBuildMCP/issues"
  },
  "mcpName": "com.xcodebuildmcp/XcodeBuildMCP"
}
```

### Integration Points

```yaml
PACKAGE_JSON:
  - files: Add "README.md", "hooks" to array
  - homepage: Add repository URL
  - repository: Add git+https URL structure
  - bugs: Add issues URL
  - keywords: Add search terms array
  - author: Add author information
  - license: Add "MIT" (match README line 225)
  - mcpName: Add MCP identifier (optional)

README_MD:
  - reference: Ensure README examples match package.json name
  - line: "npx mdsel-claude" should match package.json name field

LICENSE_FILE:
  - create: MIT license file at project root
  - template: https://opensource.org/licenses/MIT
  - add: Include "LICENSE" in files array if created

DIST_INDEX_JS:
  - verify: First line is "#!/usr/bin/env node"
  - check: Command `head -1 dist/index.js`
  - source: tsup.config.ts line 12 adds shebang banner
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Validate package.json JSON syntax
cat package.json | jq . > /dev/null
echo $?  # Expected: 0 (no errors)

# Check for trailing commas (jq will normalize)
cat package.json | jq . | diff package.json -
# Expected: Only formatting differences, no structural changes

# Verify all required fields exist
jq -e '.name' package.json > /dev/null && echo "name: OK"
jq -e '.version' package.json > /dev/null && echo "version: OK"
jq -e '.homepage' package.json > /dev/null && echo "homepage: OK"
jq -e '.repository' package.json > /dev/null && echo "repository: OK"
jq -e '.bugs' package.json > /dev/null && echo "bugs: OK"
jq -e '.keywords' package.json > /dev/null && echo "keywords: OK"
jq -e '.author' package.json > /dev/null && echo "author: OK"
jq -e '.license' package.json > /dev/null && echo "license: OK"
# Expected: All fields print "OK"

# Verify repository URL format (should be git+https)
jq -r '.repository.url' package.json | grep -q '^git+https://'
echo "Repository URL format: $?"  # Expected: 0

# Verify files array includes hooks
jq -r '.files[]' package.json | grep -q '^hooks$'
echo "Hooks in files array: $?"  # Expected: 0

# Expected: All checks pass with exit code 0
```

### Level 2: Build & Package Validation (Component Validation)

```bash
# Build the package (triggers prepack script)
npm run build
# Expected: Clean build with no errors, dist/ directory updated

# Verify shebang in built output
head -1 dist/index.js
# Expected: "#!/usr/bin/env node"

# Verify file permissions (executable bit set)
ls -l dist/index.js
# Expected: -rwxr-xr-x (executable permissions)

# Test package creation (dry-run)
npm pack --dry-run
# Expected: Lists files that would be included in package
# Verify: dist/, README.md, hooks/ are listed
# Verify: src/, tests/, plan/ are NOT listed

# Inspect tarball contents (if actual pack created)
tar -tzf mdsel-claude-*.tgz | head -20
# Expected: package, dist/, README.md, hooks/ at top level

# Expected: Build succeeds, shebang present, correct files in package
```

### Level 3: npx Execution Testing (System Validation)

```bash
# Test npx execution locally (before publishing)
npx mdsel-claude --help 2>&1 | head -5
# Note: May not support --help - may just start MCP server
# Expected: Server starts or shows usage info

# Alternative: Test MCP server startup
timeout 2 npx mdsel-claude 2>&1 || true
# Expected: Server starts on stdio, timeout terminates it
# No error messages about missing shebang or permissions

# Verify binary is executable via npm bin
npm pack
tar -xzf mdsel-claude-*.tgz
head -1 package/dist/index.js
# Expected: "#!/usr/bin/env node"

# Cleanup test artifacts
rm -rf package mdsel-claude-*.tgz

# Expected: npx can execute the package, shebang is present
```

### Level 4: Publication Readiness Validation

```bash
# Verify npm authentication (for actual publication)
npm whoami
# Expected: Shows npm username (if logged in)

# Check package name availability (before publishing)
npm view mdsel-claude 2>&1 | head -1
# Expected: "npm ERR! code E404" (name is available)
# OR: Shows existing package info (already published)

# Validate all URLs are accessible
curl -I -s https://github.com/dustinswords/mdsel-claude | grep -q "200"
# Expected: Repository homepage returns 200

curl -I -s https://github.com/dustinswords/mdsel-claude/issues | grep -q "200"
# Expected: Issues page returns 200

# Final pre-publication check
npm pack
npm install -g ./mdsel-claude-*.tgz
mdsel-claude --version 2>&1 || mdsel-claude 2>&1 | head -1
# Expected: Global install works, command is available

# Cleanup
npm uninstall -g mdsel-claude
rm -f mdsel-claude-*.tgz

# Expected: Package can be installed and executed globally
```

---

## Final Validation Checklist

### Technical Validation

- [ ] package.json has valid JSON syntax (jq parses without error)
- [ ] All new fields are present: homepage, repository, bugs, keywords, author, license
- [ ] files array includes: dist, README.md, hooks (and LICENSE if created)
- [ ] repository.url uses git+https:// protocol
- [ ] dist/index.js has shebang as first line
- [ ] dist/index.js has executable permissions (rwxr-xr-x)
- [ ] npm pack --dry-run shows correct files
- [ ] npx mdsel-claude executes without errors

### Metadata Completeness

- [ ] homepage points to valid repository URL
- [ ] repository.url follows git+https://github.com/user/repo.git format
- [ ] bugs.url points to valid GitHub issues page
- [ ] keywords include: mcp, modelcontextprotocol, mdsel, markdown
- [ ] author field contains author information (name, email optional)
- [ ] license field is "MIT" (matches README.md line 225)
- [ ] All URLs are accessible (return HTTP 200)

### Package Distribution

- [ ] Files to publish are correctly specified in files array
- [ ] Source files (src/, tests/, plan/) are NOT in published package
- [ ] Node modules are NOT in published package
- [ ] Configuration files (tsconfig.json, etc.) are NOT in published package
- [ ] dist/ directory with all built files is included
- [ ] README.md is included (npm requires documentation)
- [ ] hooks/ directory is included (user-facing feature)

### npx Execution Compatibility

- [ ] Shebang "#!/usr/bin/env node" exists in dist/index.js
- [ ] bin field points to dist/index.js
- [ ] prepack script triggers build before publish
- [ ] Local npx test executes successfully
- [ ] Package name in bin command matches package.json name field

### Documentation Alignment

- [ ] README.md installation examples match package.json name
- [ ] README.md mentions "MIT" license (matches package.json)
- [ ] README.md hooks section references files included in package
- [ ] PRD Section 3.2 "npx" requirement is satisfied

---

## Anti-Patterns to Avoid

- Don't include src/, tests/, or plan/ directories in files array (only dist/ should be published)
- Don't use https:// without git+ prefix for repository URLs (npm prefers git+https://)
- Don't forget to add hooks/ to files array (users need the hook scripts)
- Don't create LICENSE file without updating files array
- Don't use placeholder values for repository URLs (update with actual repo)
- Don't skip the shebang verification (npx requires executable with shebang)
- Don't publish without running npm pack --dry-run first
- Don't use private: true if you intend to publish to public npm
- Don't forget to test npx execution before publishing
- Don't include devDependencies in runtime dependencies (already correctly separated)

---

## Success Metrics

**Confidence Score**: 10/10 for one-pass implementation success

**Rationale**:
- Exact field structures are specified with JSON examples
- Real MCP server package.json examples provide proven patterns
- All URLs are specified with formats and examples
- Validation commands are specific and executable
- Common gotchas are explicitly documented
- The "No Prior Knowledge" test passes: someone unfamiliar with npm publishing can follow this PRP to complete the task

**Next Tasks After This PRP**:
- P3.M2.T2: Verify Publication Testing (test actual npm publish workflow)

---

*END OF PRP*
