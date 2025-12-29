# npm Dependency Management and Installation Best Practices

## Table of Contents
1. [package-lock.json](#package-lockjson)
2. [npm ci vs npm install](#npm-ci-vs-npm-install)
3. [Dependency Version Ranges](#dependency-version-ranges)
4. [engines Field](#engines-field)
5. [Post-install Scripts](#post-install-scripts)
6. [Dependency Audit](#dependency-audit)

## package-lock.json

### Why It's Needed

- **Reproducible Builds**: Ensures everyone on your team (and CI/CD systems) installs the exact same versions of dependencies
- **Faster Installations**: npm can skip dependency resolution steps, making installations faster
- **Security**: Helps detect if a dependency has been tampered with by comparing checksums
- **Deterministic Dependency Trees**: Locks down the entire dependency tree, not just direct dependencies

### When to Commit

**Always commit `package-lock.json` to source control** according to official npm documentation:

- **Applications**: Always commit for reproducible builds
- **Libraries/Packages**: Also recommended to commit
- **CI/CD pipelines**: Essential for consistency

### When NOT to Commit
- In very specific cases where you're intentionally allowing different versions across environments (rare)
- If your project explicitly chooses to manage lockfiles differently (with team consensus)

### Common Issues
1. **Conflicts in version control**: Multiple developers updating lockfiles
   - Solution: Use CI/CD to validate lockfile consistency
2. **Large file size**: Lockfiles can become large with many dependencies
   - Solution: Use `.npmignore` if needed (rarely required)
3. **Cross-platform differences**: Lockfiles may differ between OSes
   - Solution: Use `npm ci` for consistency

### Related Files
- ✅ Commit `package-lock.json`
- ❌ Do NOT commit `node_modules/` folder

## npm ci vs npm install

### npm ci (Clean Install)

**Best for: CI/CD pipelines and production environments**

Key characteristics:
- Deletes existing `node_modules` folder before installing
- Installs based exactly on `package-lock.json`
- Faster than `npm install` (skips some package resolution steps)
- Cannot modify `package-lock.json`
- Fails if `package.json` and `package-lock.json` are out of sync
- Creates a deterministic, reproducible build

### npm install

**Best for: Development workflow**

Key characteristics:
- Updates `package-lock.json` to match `package.json`
- Installs missing dependencies
- Can add new dependencies
- Respects existing `node_modules`
- More flexible but less deterministic

### Quick Reference

| Scenario | Command |
|----------|---------|
| CI/CD pipeline | `npm ci` |
| Production deployment | `npm ci` |
| Local development setup | `npm install` |
| Adding new packages | `npm install <package>` |
| After pulling changes | `npm install` |
| Fresh clone (dev machine) | `npm install` |

### Best Practice Rule
- **CI/CD scripts**: Always use `npm ci`
- **Development**: Always use `npm install`

## Dependency Version Ranges

### Version Range Operators

1. **Caret (`^`) - Recommended for most dependencies**
   - `^1.2.3` accepts `>=1.2.3` and `<2.0.0`
   - Allows updates that don't break backward compatibility
   - Best for: Application dependencies, libraries, most packages

2. **Tilde (`~`) - More conservative updates**
   - `~1.2.3` accepts `>=1.2.3` and `<1.3.0`
   - Only updates patch versions
   - Best for: Critical dependencies, when you want more stability

3. **Exact versions (`1.2.3`) - No flexibility**
   - Only installs exactly version `1.2.3`
   - Best for: Production-critical applications, locked dependencies

### Best Practices

✅ **Use `^` for most dependencies** - Get compatible updates automatically
✅ **Use `~` for critical dependencies** - More conservative, patch-only updates
✅ **Use exact versions for production** - Combine with `package-lock.json` for reproducibility
✅ **Commit `package-lock.json`** - Ensures consistent installs across environments
✅ **Regular updates** - Run `npm outdated` and update dependencies periodically

❌ **Avoid using `*` or `latest`** - Too unpredictable
❌ **Don't commit `node_modules`** - Use lockfile instead

### Example
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "~4.17.21",
    "critical-lib": "2.3.1"
  }
}
```

## engines Field

### Purpose
The `engines` field in `package.json` specifies which versions of Node.js (and potentially npm) the package is compatible with.

### Basic Syntax
```json
{
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
```

### Version Specification Methods
- **Exact version**: `"node": "16.0.0"`
- **Greater than**: `"node": ">16.0.0"`
- **Greater than or equal**: `"node": ">=14.0.0"`
- **Range**: `"node": ">=14.0.0 <18.0.0"`
- **Wildcards**: `"node": "14.x"` or `"node": "16.*"`

### Recommended Best Practices
- Use loose ranges (>=) rather than exact versions for better compatibility
- Specify both Node.js and npm versions to ensure compatibility
- Match your CI/CD and production environments
- Use semantic versioning principles
- Consider supporting older versions for wider adoption

### Common Examples
```json
{
  "engines": {
    "node": ">=18.12.0",
    "npm": ">=9.0.0"
  }
}
```

### Additional Tips
- The engines field is advisory by default
- Use `engine-strict: true` in npm config to enforce it strictly
- Keep versions in sync with your CI/CD pipeline
- Test against the minimum specified version

## Post-install Scripts

### Best Patterns

✅ **DO:**
- Keep scripts simple and fast - post-install runs during `npm install`
- Use scripts for build-time preparations (compiling assets, generating files)
- Add clear logging to help users understand what's happening
- Make scripts idempotent (can run multiple times safely)
- Use conditional checks before executing resource-intensive operations
- Consider using `prepare` script instead for development packages

### What to Avoid

❌ **DON'T:**
- Run long-running processes or downloads
- Make network calls to external services without fallbacks
- Modify global system state or directories
- Execute commands silently without user awareness
- Assume specific directory structures or environments
- Run in production builds when only needed for development
- Remove or modify critical files unexpectedly
- Use for marketing or analytics (very poor practice)

### Script Types and When to Use Them

| Script Type | Use Case | Best For |
|-------------|----------|----------|
| `preinstall` | Validation | Checking prerequisites |
| `install` | Installation | Installing binary dependencies |
| `postinstall` | Post-setup | Compiling, generating files |
| `prepublish` | Pre-publish | Build steps before publishing |
| `prepare` | Build prep | Development packages |
| `prepublishOnly` | Final build | Package-specific builds |

### Better Alternatives
- Use `prepare` script instead of `postinstall` for development packages
- Use dedicated build tools (webpack, rollup) for complex tasks
- Consider lifecycle scripts from frameworks (e.g., React, Vue)

## Dependency Audit

### npm Audit Overview

`npm audit` is a built-in command that scans your `package.json` and `package-lock.json` files for known security vulnerabilities in your dependencies.

### Basic Commands

```bash
# Run a security audit
npm audit

# Run audit with JSON output
npm audit --json

# Show details of vulnerabilities
npm audit --audit-level=moderate

# Fix vulnerabilities automatically
npm audit fix

# Fix vulnerabilities including breaking changes
npm audit fix --force
```

### Best Practices

#### 1. Regular Auditing
- Run `npm audit` in your CI/CD pipeline
- Schedule weekly or monthly dependency scans
- Audit before every production deployment

#### 2. Automated Fixes
- Use `npm audit fix` for automatic patch updates
- Test thoroughly after automatic fixes
- Review changelog for breaking changes

#### 3. Dependency Management
- Keep dependencies up to date with `npm update`
- Use `npm outdated` to identify outdated packages
- Pin specific versions in package.json
- Use semantic versioning ranges carefully

#### 4. Additional Security Tools
- **Snyk**: Advanced vulnerability scanning
- **GitHub Dependabot**: Automated dependency updates
- **OWASP Dependency-Check**: Software composition analysis
- **WhiteSource**: Open source security management

#### 5. Lock File Management
- Always commit `package-lock.json`
- Don't manually modify lock files
- Use npm ci instead of npm install in production

#### 6. Code Review
- Review new dependencies before adding them
- Check maintainers and repository activity
- Look for alternative packages with fewer dependencies

### Vulnerability Severity Levels
- **low**: Low impact vulnerabilities
- **moderate**: Medium impact vulnerabilities
- **high**: High impact vulnerabilities
- **critical**: Critical vulnerabilities that should be fixed immediately

## Official Documentation Sources

- [npm package-lock.json Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json)
- [npm install vs npm ci Documentation](https://docs.npmjs.com/cli/v8/commands/npm-ci)
- [npm Version Ranges Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#dependencies)
- [npm engines Field Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#engines)
- [npm scripts Documentation](https://docs.npmjs.com/cli/v8/using-npm/scripts)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## Additional Resources

- [npm Security Best Practices](https://docs.npmjs.com/about-security)
- [OWASP NodeGoat Project](https://owasp.org/www-project-nodegoat/) - Security best practices for Node.js
- [Snyk npm Security Scanner](https://snyk.io/npm/)
- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)