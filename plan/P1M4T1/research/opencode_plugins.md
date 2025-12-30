# OpenCode Plugin Installation Research

## Overview
This document researches OpenCode (VS Code compatible) plugin installation mechanisms, discovery patterns, and development requirements for TypeScript/JavaScript plugins.

## 1. OpenCode Plugin Discovery

Since OpenCode is VS Code compatible, it likely follows similar discovery mechanisms:

### Extension Discovery Methods
- **Marketplace Integration**: Primary discovery through OpenCode's extension marketplace
- **Local Extension Directory**: Loading from `~/.opencode/extensions/` or similar
- **Workspace Extensions**: Project-specific extensions in `.vscode/` directories
- **Development Mode**: Loading from source during development

### Plugin Manifest Detection
OpenCode likely discovers extensions through:
- `package.json` files with specific metadata fields
- Extension API version compatibility checks
- Extension category and language support declarations
- Publisher verification and trust levels

## 2. Plugin Installation Locations and Mechanisms

### Default Installation Paths
- **User Extensions**: `~/.opencode/extensions/`
- **System Extensions**: `/usr/share/opcode/extensions/` (Linux)
- **Portable Mode**: Relative to executable directory
- **Workspace Extensions**: Project-local in `.opcode/extensions/`

### Installation Methods
```typescript
// Command line installation
opcode --install-extension publisher.extension-name

// UI-based installation
1. Extensions view (Ctrl+Shift+X)
2. Search marketplace
3. Install button

// Direct file installation
1. Download .vsix file
2. Install from file: opcode --install-extension path/to/extension.vsix
```

## 3. package.json Requirements for TypeScript/JavaScript Plugins

### Core Required Fields
```json
{
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "Extension description",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.60.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
    "onLanguage:javascript",
    "onLanguage:typescript"
  ],
  "main": "./out/extension.js",
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.60.0",
    "@types/node": "14.x",
    "typescript": "^4.9.4"
  }
}
```

### Extension-Specific Fields
```json
{
  "contributes": {
    "commands": [
      {
        "command": "my-extension.command",
        "title": "My Command",
        "category": "My Extension"
      }
    ],
    "languages": [
      {
        "id": "my-language",
        "aliases": ["My Language", "my"],
        "extensions": [".my"],
        "configuration": "./language-configuration.json"
      }
    ],
    "keybindings": [
      {
        "command": "my-extension.command",
        "key": "ctrl+shift+m",
        "mac": "cmd+shift+m"
      }
    ]
  },
  "capabilities": {
    "untrustedWorkspaces": {
      "supported": true,
      "description": "Run untrusted workspaces"
    }
  }
}
```

## 4. Plugin Registration with the Editor

### Extension Activation
```typescript
// Main extension file (extension.ts)
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "my-extension" is now active!');

    // Register commands
    let disposable = vscode.commands.registerCommand(
        'my-extension.command',
        () => {
            vscode.window.showInformationMessage('Hello World from My Extension!');
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Extension "my-extension" is now deactivated!');
}
```

### Extension Context and Lifecycle
- `activate()`: Called when extension is activated
- `deactivate()`: Called when extension is deactivated
- `ExtensionContext`: Provides access to extension utilities
- `subscriptions`: Array to manage disposables

### Event-Driven Registration
```typescript
// Language activation
context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'javascript' },
        new MyCompletionProvider()
    )
);

// Document listeners
context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
        console.log('Document opened:', document.fileName);
    })
);
```

## 5. Plugin Loading and Activation Patterns

### Activation Strategies
```typescript
// 1. Event-based activation (recommended)
"activationEvents": [
    "onLanguage:javascript",
    "onLanguage:typescript",
    "onCommand:my-extension.command",
    "onStartupFinished"
]

// 2. Lazy activation with activation events
export function activate(context: vscode.ExtensionContext) {
    // Only activated when specific events occur
}

// 3. Startup activation
"activationEvents": ["*"] // Activates on startup (use sparingly)
```

### Extension Dependencies
```json
{
  "extensionDependencies": [
    "vscode.typescript-language-features",
    "vscode.javascript"
  ],
  "extensionPack": [
    "publisher.extension1",
    "publisher.extension2"
  ]
}
```

### Extension Loading Order
- **Dependencies**: Extensions load before dependents
- **Activation**: Based on activationEvents
- **Priority**: Core extensions load first
- **Circular Dependencies**: Detected and prevented

## 6. TypeScript Plugin Development Best Practices

### Project Structure
```
my-extension/
├── src/
│   ├── extension.ts
│   ├── providers/
│   │   ├── completion.ts
│   │   └── diagnostics.ts
│   ├── commands/
│   │   └── myCommand.ts
│   └── utils/
│       └── helpers.ts
├── test/
│   ├── suite/
│   │   ├── extension.test.ts
│   │   └── myCommand.test.ts
│   └── runTest.ts
├── .vscodeignore
├── package.json
├── tsconfig.json
├── README.md
└── vsc-extension-quickstart.md
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": [
      "ES2020"
    ],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "moduleResolution": "node",
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "exclude": [
    "node_modules",
    ".vscode-test",
    "out/test"
  ]
}
```

### Testing Setup
```json
{
  "scripts": {
    "test": "vscode-test",
    "test:watch": "tsc -watch"
  },
  "devDependencies": {
    "@types/vscode": "^1.60.0",
    "@types/jest": "^27.0.0",
    "@types/mocha": "^9.0.0",
    "@vscode/test-electron": "^2.1.2"
  }
}
```

## 7. NPM-Based Plugin Distribution

### Publishing to Marketplace
```bash
# Package extension
vsce package

# Publish to marketplace
vsce publish

# Target specific marketplace
vsce publish --target opcode-marketplace
```

### Package Configuration (package.json for publishing)
```json
{
  "publisher": "my-publisher",
  "repository": {
    "type": "git",
    "url": "https://github.com/my-publisher/my-extension.git"
  },
  "bugs": {
    "url": "https://github.com/my-publisher/my-extension/issues"
  },
  "galleryBanner": {
    "color": "#666666",
    "theme": "dark"
  },
  "keywords": [
    "javascript",
    "typescript",
    "web",
    "development"
  ]
}
```

### Extension Validation
```bash
# Validate extension
vsce validate

# Check for issues
vsce lint

# Test with sample projects
vsce package --yarn
```

## 8. Advanced Patterns

### Extension Telemetry
```typescript
import * as vscode from 'vscode';

export class TelemetryManager {
    private static instance: TelemetryManager;
    private context: vscode.ExtensionContext;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    static getInstance(context: vscode.ExtensionContext): TelemetryManager {
        if (!TelemetryManager.instance) {
            TelemetryManager.instance = new TelemetryManager(context);
        }
        return TelemetryManager.instance;
    }

    public sendEvent(eventName: string, properties?: any) {
        this.context.telemetryReporter.sendTelemetryEvent(eventName, properties);
    }
}
```

### Extension Configuration
```typescript
// settings.ts
import * as vscode from 'vscode';

export interface ExtensionSettings {
    enabled: boolean;
    maxItems: number;
    customPath: string;
}

export function getSettings(): ExtensionSettings {
    const config = vscode.workspace.getConfiguration('myExtension');
    return {
        enabled: config.get<boolean>('enabled', true),
        maxItems: config.get<number>('maxItems', 10),
        customPath: config.get<string>('customPath', '')
    };
}
```

## 9. Debugging and Development

### Extension Development
```json
{
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

### Development Workflow
```bash
# Development mode
1. npm run compile
2. Press F5 to launch new Extension Development Host
3. Debug your extension in separate window

# Packaging
vsce package --yarn --no-dependencies

# Testing
npm test
```

## Recommended Resources

### Official Documentation
- [VS Code Extension API Documentation](https://code.visualstudio.com/api)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/extension-guides)
- [Extension Marketplace Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

### Development Tools
- [Yeoman Generator for VS Code Extensions](https://github.com/microsoft/vscode-generator-code)
- [VS Code Extension Manager (vsce)](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Test Runner](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

### Community Resources
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [VS Code API Documentation](https://code.visualstudio.com/api/references/vscode-api)
- [Extension Development Guidelines](https://code.visualstudio.com/api/extension-guides/overview)

## Summary

OpenCode plugins follow VS Code's proven architecture with:
1. **Discovery**: Through marketplace, local directories, and workspace configurations
2. **Installation**: Multiple methods including UI, CLI, and file-based
3. **Registration**: package.json metadata with activation events and contributions
4. **Activation**: Event-driven lifecycle with proper cleanup
5. **Distribution**: NPM-based with marketplace integration

The TypeScript/JavaScript ecosystem is well-supported with comprehensive tooling for development, testing, and distribution.