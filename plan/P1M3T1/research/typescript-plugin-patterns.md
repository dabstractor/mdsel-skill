# TypeScript Plugin Development Patterns for OpenCode

## Research Summary

This document provides comprehensive patterns and best practices for developing TypeScript plugins for OpenCode, focusing on file operations, cross-platform compatibility, and proper type safety.

---

## 1. TypeScript/JavaScript Plugin Development Best Practices

### Plugin Architecture Pattern

```typescript
interface Plugin {
  name: string;
  version: string;
  description: string;
  initialize(): void;
  execute(context: PluginContext): Promise<Result>;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  async execute(pluginName: string, context: PluginContext): Promise<Result> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    return await plugin.execute(context);
  }
}
```

### Key Best Practices

1. **Type Safety**: Use TypeScript strict mode and proper interfaces
2. **Error Boundaries**: Implement comprehensive error handling
3. **Modularity**: Keep plugins focused on single responsibilities
4. **Testing**: Write unit and integration tests
5. **Documentation**: Document all public APIs and usage examples

---

## 2. How to Properly Structure a TypeScript Plugin File

### Recommended Project Structure

```
my-plugin/
├── src/
│   ├── index.ts              # Main plugin entry point
│   ├── handlers/             # Command/event handlers
│   │   ├── fileHandler.ts
│   │   └── wordCounter.ts
│   ├── utils/                # Helper functions
│   │   ├── fileUtils.ts
│   │   └── pathUtils.ts
│   ├── types/                # Type definitions
│   │   ├── pluginTypes.ts
│   │   └── fileTypes.ts
│   └── config/
│       └── defaults.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Main Plugin Entry Point (`src/index.ts`)

```typescript
import { WordCountPlugin } from './handlers/wordCounter';
import { FileProcessor } from './handlers/fileHandler';
import { PluginConfig } from './types/pluginTypes';

export class WordCountPlugin {
  name = 'word-count';
  version = '1.0.0';
  description = 'Counts words in text files';

  private fileProcessor: FileProcessor;
  private config: PluginConfig;

  constructor(config: Partial<PluginConfig> = {}) {
    this.config = {
      defaultDirectory: process.cwd(),
      supportedExtensions: ['.txt', '.md', '.js', '.ts'],
      ...config
    };
    this.fileProcessor = new FileProcessor(this.config);
  }

  initialize(): void {
    console.log(`Initializing ${this.name} plugin v${this.version}`);
  }

  async execute(context: PluginContext): Promise<Result> {
    try {
      const { filePath, options } = context;
      const wordCount = await this.fileProcessor.countWords(filePath);

      return {
        success: true,
        data: {
          wordCount,
          filePath,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export factory function for easy instantiation
export function createWordCountPlugin(config?: Partial<PluginConfig>): WordCountPlugin {
  return new WordCountPlugin(config);
}
```

---

## 3. Node.js File System Operations for Word Counting

### Basic File Reading

```typescript
import { promises as fs } from 'fs';
import path from 'path';

class FileProcessor {
  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  async countWords(filePath: string): Promise<number> {
    const content = await this.readFile(filePath);
    return this.countWordsInText(content);
  }

  private countWordsInText(text: string): number {
    // Handle various whitespace characters and punctuation
    const words = text
      .split(/\s+/)
      .map(word => word.replace(/[^\w\u4e00-\u9fff]/g, ''))
      .filter(word => word.length > 0);

    return words.length;
  }
}
```

### Directory Processing

```typescript
class FileProcessor {
  async processDirectory(dirPath: string): Promise<WordCountResult[]> {
    const files = await this.findTextFiles(dirPath);
    const results: WordCountResult[] = [];

    for (const file of files) {
      try {
        const wordCount = await this.countWords(file);
        results.push({ filePath: file, wordCount });
      } catch (error) {
        console.warn(`Failed to process ${file}: ${error}`);
      }
    }

    return results;
  }

  private async findTextFiles(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const textFiles: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.findTextFiles(fullPath);
        textFiles.push(...subFiles);
      } else if (this.isTextFile(entry.name)) {
        textFiles.push(fullPath);
      }
    }

    return textFiles;
  }

  private isTextFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.txt', '.md', '.js', '.ts', '.json'].includes(ext);
  }
}
```

---

## 4. Cross-Platform File Handling (Windows/Linux/macOS)

### Path Handling Best Practices

```typescript
import { platform } from 'os';
import path from 'path';

class CrossPlatformFileHandler {
  private platform: NodeJS.Platform;

  constructor() {
    this.platform = platform();
  }

  // Normalize paths for cross-platform compatibility
  normalizePath(filePath: string): string {
    // Convert to POSIX paths even on Windows for consistency
    return path.posix.join(...filePath.split(path.sep));
  }

  // Handle file paths properly across platforms
  resolvePath(...segments: string[]): string {
    return path.resolve(...segments);
  }

  // Check file existence with proper error handling
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
```

### Line Ending Normalization

```typescript
import { EOL } from 'os';

class TextNormalizer {
  // Normalize line endings for cross-platform compatibility
  normalizeLineEndings(text: string): string {
    // Convert all line endings to the current platform's EOL
    return text.replace(/\r\n|\r|\n/g, EOL);
  }

  // Remove BOM if present
  removeBOM(text: string): string {
    return text.replace(/^\uFEFF/, '');
  }
}
```

### File Permissions Handling

```typescript
import { constants as fsConstants } from 'fs';

class FilePermissionHandler {
  // Check file permissions cross-platform
  async checkFilePermissions(filePath: string): Promise<Permissions> {
    try {
      await fs.access(filePath, fsConstants.R_OK);
      return { readable: true, writable: false };
    } catch (error) {
      if (error.code === 'EACCES') {
        return { readable: false, writable: false };
      }
      throw error;
    }
  }

  // Set appropriate file permissions
  async setFilePermissions(filePath: string, mode: number): Promise<void> {
    try {
      await fs.chmod(filePath, mode);
    } catch (error) {
      // Windows doesn't support all Unix permissions
      if (this.platform === 'win32' && error.code === 'EPERM') {
        console.warn('Permission change not supported on Windows');
        return;
      }
      throw error;
    }
  }
}
```

---

## 5. Error Handling Patterns for TypeScript Plugins

### Custom Error Types

```typescript
class PluginError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

class FileOperationError extends PluginError {
  constructor(
    message: string,
    public filePath: string,
    public errorCode: string
  ) {
    super(message, 'FILE_OPERATION_ERROR');
    this.name = 'FileOperationError';
  }
}

class ValidationError extends PluginError {
  constructor(
    message: string,
    public validationErrors: string[]
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

### Comprehensive Error Handler

```typescript
class ErrorHandler {
  static handleFileError(error: unknown, filePath: string): never {
    if (error instanceof PluginError) {
      throw error;
    }

    if (error instanceof Error) {
      switch (error.code) {
        case 'ENOENT':
          throw new FileOperationError(
            `File not found: ${filePath}`,
            filePath,
            'FILE_NOT_FOUND'
          );
        case 'EACCES':
          throw new FileOperationError(
            `Permission denied: ${filePath}`,
            filePath,
            'PERMISSION_DENIED'
          );
        case 'EISDIR':
          throw new FileOperationError(
            `Path is a directory: ${filePath}`,
            filePath,
            'IS_DIRECTORY'
          );
        default:
          throw new FileOperationError(
            `Failed to access file: ${filePath}`,
            filePath,
            'UNKNOWN_ERROR'
          );
      }
    }

    throw new PluginError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  static validateInput(input: any, schema: any): void {
    // Implement validation logic
    const errors: string[] = [];

    if (!input.filePath) {
      errors.push('filePath is required');
    }

    if (errors.length > 0) {
      throw new ValidationError('Invalid input', errors);
    }
  }
}
```

### Error Recovery Patterns

```typescript
class ResilientFileProcessor {
  private maxRetries = 3;
  private retryDelay = 1000;

  async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries) {
          break;
        }

        console.warn(`Attempt ${attempt} failed for ${context}, retrying...`);
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw new PluginError(
      `Operation failed after ${this.maxRetries} attempts: ${context}`,
      'RETRY_EXHAUSTED',
      { originalError: lastError }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 6. Type Definitions for OpenCode Plugins

### Plugin Context Interface

```typescript
interface PluginContext {
  // Core plugin context
  pluginName: string;
  version: string;
  config: PluginConfig;

  // Input data
  input: {
    filePath: string;
    options?: PluginOptions;
    metadata?: Record<string, any>;
  };

  // System information
  system: {
    platform: NodeJS.Platform;
    arch: string;
    nodeVersion: string;
    workingDirectory: string;
  };

  // Plugin manager reference (optional)
  pluginManager?: PluginManager;
}

interface PluginConfig {
  // File processing settings
  defaultDirectory: string;
  supportedExtensions: string[];
  maxFileSize: number;
  encoding: string;

  // Processing options
  includeHiddenFiles: boolean;
  recursive: boolean;
  caseSensitive: boolean;

  // Performance settings
  maxConcurrency: number;
  chunkSize: number;
}

interface PluginOptions {
  // Word count options
  countUniqueWords?: boolean;
  includeNumbers?: boolean;
  minLength?: number;

  // File processing options
  pattern?: string;
  exclude?: string[];

  // Output options
  format?: 'json' | 'csv' | 'table';
  sortBy?: 'wordCount' | 'fileName' | 'path';
  sortOrder?: 'asc' | 'desc';
}
```

### Result Types

```typescript
interface Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    timestamp: string;
  };
}

interface WordCountResult {
  filePath: string;
  wordCount: number;
  uniqueWords?: number;
  characterCount: number;
  lineCount: number;
  processingTime: number;
}

interface BatchWordCountResult {
  totalFiles: number;
  totalWords: number;
  averageWordsPerFile: number;
  results: WordCountResult[];
  errors: Array<{
    filePath: string;
    error: string;
  }>;
}
```

---

## 7. Console.log vs Return Values for Output

### Logging Best Practices

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  log(level: LogLevel, message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

class PluginLogger implements Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...args);
        break;
      case 'info':
        console.info(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }
}
```

### Output Strategy Pattern

```typescript
interface OutputStrategy {
  format(data: any): string;
  write(output: string, target?: string): Promise<void>;
}

class ConsoleOutput implements OutputStrategy {
  format(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  async write(output: string, _?: string): Promise<void> {
    console.log(output);
  }
}

class FileOutput implements OutputStrategy {
  async write(output: string, target: string): Promise<void> {
    await fs.writeFile(target, output, 'utf-8');
  }

  format(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}

class CsvOutput implements OutputStrategy {
  format(data: WordCountResult[]): string {
    const headers = ['File Path', 'Word Count', 'Character Count', 'Line Count'];
    const rows = data.map(result => [
      result.filePath,
      result.wordCount.toString(),
      result.characterCount.toString(),
      result.lineCount.toString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async write(output: string, target: string): Promise<void> {
    await fs.writeFile(target, output, 'utf-8');
  }
}

class OutputManager {
  private strategy: OutputStrategy;

  constructor(strategy: OutputStrategy) {
    this.strategy = strategy;
  }

  async output(data: any, target?: string): Promise<void> {
    const formatted = this.strategy.format(data);
    await this.strategy.write(formatted, target);
  }
}
```

### Proper Return Value Usage

```typescript
class WordCountPlugin {
  async execute(context: PluginContext): Promise<Result<WordCountResult>> {
    const logger = new PluginLogger('WordCountPlugin');

    try {
      logger.info('Processing file: %s', context.input.filePath);

      // Always return structured data, not just console.log
      const result = await this.processFile(context.input.filePath);

      logger.info('Completed processing: %d words found', result.wordCount);

      return {
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Processing failed: %s', error instanceof Error ? error.message : 'Unknown error');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Never use console.log for primary output - use return values
  private async processFile(filePath: string): Promise<WordCountResult> {
    // Implementation returns structured data
    const content = await this.readFile(filePath);
    return this.analyzeText(content, filePath);
  }
}
```

---

## Implementation Examples

### Complete Word Counting Plugin Example

```typescript
// src/index.ts
import { WordCountPlugin } from './WordCountPlugin';
import { createLogger } from './utils/logger';

const logger = createLogger('WordCountPlugin');

// Initialize plugin
const plugin = new WordCountPlugin({
  defaultDirectory: process.cwd(),
  supportedExtensions: ['.txt', '.md', '.js', '.ts'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  includeHiddenFiles: false
});

plugin.initialize();

// Execute with proper context
const context: PluginContext = {
  pluginName: 'word-count',
  version: '1.0.0',
  config: plugin.getConfig(),
  input: {
    filePath: './example.txt',
    options: {
      countUniqueWords: true,
      includeNumbers: true,
      format: 'json'
    }
  },
  system: {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    workingDirectory: process.cwd()
  }
};

// Execute and handle result
plugin.execute(context)
  .then(result => {
    if (result.success) {
      logger.info('Success: %d words counted', result.data.wordCount);
      process.stdout.write(JSON.stringify(result.data, null, 2));
    } else {
      logger.error('Error: %s', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('Critical error: %s', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  });
```

---

## Additional Resources

### TypeScript Plugin Development Resources

1. [TypeScript Documentation - Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
2. [Node.js Documentation - File System API](https://nodejs.org/api/fs.html)
3. [ESLint Plugin Development Guide](https://eslint.org/docs/developer-guide/working-with-plugins)
4. [VSCode Extension API Documentation](https://code.visualstudio.com/api)

### Cross-Platform Development Resources

1. [Node.js Path Module Documentation](https://nodejs.org/api/path.html)
2. [Cross-Platform File Handling Best Practices](https://github.com/sindresorhus/filenamify)
3. [Line Ending Normalization](https://github.com/eemeli/orgajs#line-endings)

### Error Handling Resources

1. [JavaScript Error Handling Patterns](https://addyosmani.com/blog/javascript-error-handling-patterns/)
2. [TypeScript Error Handling Best Practices](https://basarat.gitbook.io/typescript/type-system/error-handling)

---

*This research document provides comprehensive patterns and examples for TypeScript plugin development with a focus on file operations and cross-platform compatibility. Use these patterns as a foundation for building robust, maintainable OpenCode plugins.*