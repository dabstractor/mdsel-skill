name: "P1.M2.T1: Define mdsel Response Types"
description: |

---

## Goal

**Feature Goal**: Create TypeScript type definitions that exactly match mdsel CLI's JSON output structures for both `index` and `select` commands.

**Deliverable**: `src/mdsel/types.ts` file containing all mdsel response type interfaces exported for use by the CLI invoker and MCP tool handlers.

**Success Definition**: All type definitions compile successfully with `tsc --noEmit`, match mdsel 1.0.0 JSON output exactly, and are importable by subsequent tasks (P1.M2.T2, P1.M3).

## User Persona

**Target User**: TypeScript developers implementing mdsel CLI invocation (P1.M2.T2) and MCP tool handlers (P1.M3).

**Use Case**: Type-safe parsing and handling of mdsel JSON responses without runtime validation overhead.

**User Journey**:
1. Developer imports types from `src/mdsel/types.ts`
2. Uses `CLIResponse<T>` generic wrapper for all mdsel responses
3. Uses specific `IndexData` or `SelectData` types for command-specific data
4. Types provide autocomplete and compile-time safety for response handling

**Pain Points Addressed**:
- No manual type definition required when consuming mdsel output
- Compile-time verification of response structure access
- Single source of truth for mdsel response contract

## Why

- **Foundation for Type Safety**: All subsequent mdsel integration (invoker, tools) depends on correct type definitions
- **Single Source of Truth**: Prevents drift between expected and actual mdsel output structure
- **Enables P1.M2.T2**: CLI invoker implementation requires these types for return type signatures
- **Enables P1.M3**: MCP tool handlers use these types for type-safe response handling

## What

Create `src/mdsel/types.ts` with TypeScript interfaces matching mdsel 1.0.0 JSON output exactly.

### Success Criteria

- [ ] `src/mdsel/types.ts` exists with all required interfaces
- [ ] `npm run build` compiles successfully with no type errors
- [ ] Types match mdsel JSON output structure exactly (verified against `external_deps.md`)
- [ ] All types are properly exported for import by other modules

## All Needed Context

### Context Completeness Check

**Question**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**Answer**: Yes. This PRP includes:
- Exact type definitions from mdsel documentation
- File placement and naming conventions
- TypeScript configuration requirements
- Import/export patterns used in the project
- Validation commands to verify implementation

### Documentation & References

```yaml
# MUST READ - Primary type specification
- file: plan/docs/architecture/external_deps.md
  why: Contains authoritative TypeScript type definitions for all mdsel responses
  critical: Lines 26-106 contain the exact interface definitions to implement
  gotcha: Note that CLIResponse<T> is a generic wrapper - data field is T | null, not just T

# Project structure guidance
- file: plan/docs/architecture/implementation_notes.md
  why: Section 6 shows expected directory structure (src/mdsel/types.ts)
  pattern: Project uses flat mdsel/ directory, not nested subdirectories
  gotcha: File must be exactly at `src/mdsel/types.ts` for subsequent imports to work

# Existing code patterns
- file: src/server.ts
  why: Shows import pattern with .js extensions (even for .ts source files)
  pattern: `import { Server } from '@modelcontextprotocol/sdk/server/index.js';`
  gotcha: CRITICAL: Always use .js extension in imports - source is .ts but compiles to .js

# TypeScript configuration
- file: tsconfig.json
  why: Shows strict mode is enabled, exact compiler settings
  pattern: strict: true, declaration: true, module: "NodeNext"
  gotcha: All types must be compatible with strict mode checking

# Task dependencies
- file: tasks.json
  why: Shows P1.M2.T1.S1 (error types) must be done before P1.M2.T1.S2 (data types)
  pattern: Subtasks have dependency ordering
  gotcha: S2 depends on S1 - implement CLIResponse generic wrapper first
```

### Current Codebase tree

```bash
/home/dustin/projects/mdsel-claude-attempt-3/
├── dist/
│   ├── server.d.ts          # Generated type declarations (example output)
│   ├── server.js            # Compiled JavaScript
│   └── server.js.map        # Source maps
├── src/
│   └── server.ts            # Minimal MCP server skeleton
├── plan/
│   └── docs/
│       └── architecture/
│           ├── external_deps.md       # mdsel type specifications (SOURCE OF TRUTH)
│           ├── implementation_notes.md
│           └── tool_descriptions.md
├── tsconfig.json            # TypeScript configuration
├── tsup.config.ts           # Build configuration
├── vitest.config.ts         # Test configuration
├── package.json
└── tasks.json               # Task breakdown with dependencies
```

### Desired Codebase tree after implementation

```bash
/home/dustin/projects/mdsel-claude-attempt-3/
├── src/
│   ├── server.ts            # Existing MCP server skeleton
│   └── mdsel/
│       └── types.ts         # NEW: mdsel response type definitions
├── dist/
│   ├── mdsel/
│   │   ├── types.d.ts       # NEW: Generated type declarations
│   │   └── types.js         # NEW: Compiled types (empty runtime, just exports)
│   └── server.ts
```

**File Responsibility**: `src/mdsel/types.ts` contains ONLY TypeScript interface/type definitions. No runtime code, no functions, no logic - pure type declarations that compile to empty JavaScript.

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: ES Module imports require .js extension
// WRONG: import { Server } from '@modelcontextprotocol/sdk/server/index';
// RIGHT:  import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// The .js extension refers to the COMPILED output, not source file name

// CRITICAL: CLIResponse<T> data field is T | null, not just T
// interface CLIResponse<T> {
//   data: T | null;  // Can be null on errors
// }

// CRITICAL: mdsel uses "heading" as type, not "heading:h1"
// The type field contains just "heading", depth is separate field
// interface HeadingDescriptor {
//   type: string;  // e.g., "heading" (not "heading:h1")
//   depth: 1 | 2 | 3 | 4 | 5 | 6;  // Level is here
// }

// CRITICAL: Block type in SelectMatch is literal string, not enum
// interface SelectMatch {
//   type: string;  // "section", "paragraph", "code", "list", "table", "blockquote"
// }

// CRITICAL: children_available in SelectMatch uses camelCase
// interface SelectMatch {
//   children_available: ChildInfo[];  // Not childrenAvailable or children
// }

// NOTE: src/mdsel/types.ts compiles to nearly-empty JavaScript
// TypeScript types erase at runtime - this file exports types only
// The compiled .js file will have export statements but no runtime values
```

## Implementation Blueprint

### Data models and structure

All types are pure TypeScript interfaces with no runtime logic. The file exports type definitions used for compile-time type checking.

```typescript
// Generic wrapper for all mdsel CLI responses
interface CLIResponse<T>

// Error handling types
interface ErrorEntry
type ErrorType

// Index command types
interface IndexData
interface DocumentIndex
interface HeadingDescriptor
interface BlockSummary
interface IndexSummary

// Select command types
interface SelectData
interface SelectMatch
interface ChildInfo
interface PaginationInfo

// Additional mdsel types
interface NodeDescriptor
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE src/mdsel/ directory
  - ACTION: Create directory at src/mdsel/
  - PLACEMENT: Adjacent to src/server.ts in src/ root
  - DEPENDENCIES: P1.M1.T1.S5 (directory structure from milestone 1)

Task 2: CREATE src/mdsel/types.ts with CLIResponse wrapper and error types (P1.M2.T1.S1)
  - IMPLEMENT: CLIResponse<T> generic interface
  - IMPLEMENT: ErrorEntry interface
  - IMPLEMENT: ErrorType union type
  - FOLLOW pattern: plan/docs/architecture/external_deps.md lines 26-147
  - NAMING: PascalCase for interfaces, union types use PascalCase
  - FIELD NAMES: snake_case for all mdsel fields (exact match to JSON)
  - EXPORT: Use 'export' keyword on each interface for named imports
  - PLACEMENT: src/mdsel/types.ts

Task 3: ADD index command data types to src/mdsel/types.ts (P1.M2.T1.S2 part 1)
  - IMPLEMENT: IndexData interface (documents, summary)
  - IMPLEMENT: DocumentIndex interface
  - IMPLEMENT: HeadingDescriptor interface
  - IMPLEMENT: BlockSummary interface
  - IMPLEMENT: IndexSummary interface
  - IMPLEMENT: NodeDescriptor interface (used by DocumentIndex.root)
  - FOLLOW pattern: plan/docs/architecture/external_deps.md lines 39-71
  - NAMING: Exact field names from mdsel spec (e.g., content_preview, children_count)
  - DEPENDENCIES: Task 2 (CLIResponse<T> wrapper must exist first)
  - PLACEMENT: Add to existing src/mdsel/types.ts file

Task 4: ADD select command data types to src/mdsel/types.ts (P1.M2.T1.S2 part 2)
  - IMPLEMENT: SelectData interface
  - IMPLEMENT: SelectMatch interface
  - IMPLEMENT: ChildInfo interface
  - IMPLEMENT: PaginationInfo interface (optional, used by SelectMatch.pagination)
  - FOLLOW pattern: plan/docs/architecture/external_deps.md lines 86-106
  - NAMING: children_available (snake_case, not camelCase)
  - DEPENDENCIES: Task 2 (CLIResponse<T> wrapper must exist first)
  - PLACEMENT: Add to existing src/mdsel/types.ts file
```

### Implementation Patterns & Key Details

```typescript
// PATTERN: All interfaces use 'export' keyword for named imports
// src/mdsel/types.ts
export interface CLIResponse<T> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;  // ISO 8601 timestamp string
  data: T | null;
  partial_results?: unknown[];
  unresolved_selectors?: string[];
  warnings?: string[];
  errors?: ErrorEntry[];
}

// PATTERN: Union types use 'export type' with literal values
export type ErrorType =
  | 'FILE_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'INVALID_SELECTOR'
  | 'SELECTOR_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'PROCESSING_ERROR';

export interface ErrorEntry {
  type: ErrorType;
  code: string;
  message: string;
  file?: string;
  selector?: string;
  suggestions?: string[];
}

// PATTERN: Index data types match mdsel output exactly
export interface IndexData {
  documents: DocumentIndex[];
  summary: IndexSummary;
}

export interface DocumentIndex {
  namespace: string;          // Derived from filename
  file_path: string;
  root: NodeDescriptor | null;
  headings: HeadingDescriptor[];
  blocks: BlockSummary;
}

// GOTCHA: type is "heading", not "heading:h1" - level is in depth field
export interface HeadingDescriptor {
  selector: string;           // e.g., "h2.0"
  type: string;               // "heading"
  depth: 1 | 2 | 3 | 4 | 5 | 6;  // Heading level as number literal
  text: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
  section_word_count: number;
  section_truncated: boolean;
}

// PATTERN: Numeric fields use 'number' type (not specific literals)
export interface BlockSummary {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}

// GOTCHA: children_available uses snake_case (not camelCase)
export interface SelectData {
  matches: SelectMatch[];
  unresolved: string[];
}

export interface SelectMatch {
  selector: string;
  type: string;               // "section", "paragraph", "code", "list", "table", "blockquote"
  content: string;
  truncated: boolean;
  pagination?: PaginationInfo;
  children_available: ChildInfo[];  // CRITICAL: snake_case field name
}

export interface ChildInfo {
  selector: string;
  type: string;
  preview: string;
}

// OPTIONAL: PaginationInfo (may be undefined)
export interface PaginationInfo {
  // Structure not fully documented in external_deps.md
  // Using loose 'any' or 'unknown' if exact structure unknown
  [key: string]: unknown;
}

// ADDITIONAL: NodeDescriptor for DocumentIndex.root field
export interface NodeDescriptor {
  // Structure placeholder - update if mdsel documents this
  // Currently root is always null per external_deps.md
  [key: string]: unknown;
}

export interface IndexSummary {
  total_documents: number;
  total_nodes: number;
  total_selectors: number;
}
```

### Integration Points

```yaml
NO CODE CHANGES: This task creates a new file with pure type definitions
- No modifications to existing files
- No imports needed by this file
- No runtime code

CONSUMED BY (future tasks):
- P1.M2.T2: src/mdsel/invoke.ts will import CLIResponse, ErrorEntry
- P1.M3.T1: src/tools/mdsel-index.ts will import CLIResponse<IndexData>
- P1.M3.T2: src/tools/mdsel-select.ts will import CLIResponse<SelectData>

IMPORT PATTERN for future tasks:
import { CLIResponse, IndexData, SelectData } from '../mdsel/types.js';
// Note: .js extension even though source is .ts
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after completing all tasks - fix before proceeding
npm run build                 # Runs tsup to compile TypeScript

# Expected: No errors. dist/mdsel/types.js and dist/mdsel/types.d.ts created

# TypeScript type checking (more thorough than build)
npx tsc --noEmit              # Type check without emitting files

# Expected: Zero type errors

# Verify file exists and compiles
ls -la src/mdsel/types.ts     # Confirm source file exists
ls -la dist/mdsel/types.d.ts  # Confirm declaration file generated

# If errors exist, READ the error message carefully:
# - Check for missing field names (compare to external_deps.md)
# - Check for type mismatches (e.g., string vs number)
# - Check for export statements (all interfaces need 'export')
```

### Level 2: Type Usage Verification (Component Validation)

```bash
# Verify types can be imported by creating a test import
cat > /tmp/test-import.ts << 'EOF'
import { CLIResponse, IndexData, SelectData, ErrorEntry, ErrorType } from './src/mdsel/types.js';

// Test that CLIResponse<T> works with specific types
const testIndex: CLIResponse<IndexData> = {
  success: true,
  command: 'index',
  timestamp: '2025-12-29T00:00:00.000Z',
  data: null
};

const testError: ErrorEntry = {
  type: 'FILE_NOT_FOUND',
  code: 'ENOENT',
  message: 'File not found'
};

console.log('Types imported successfully');
EOF

npx tsc --noEmit /tmp/test-import.ts

# Expected: No type errors

# Clean up
rm /tmp/test-import.ts
```

### Level 3: Integration Testing (System Validation)

```bash
# Verify build produces expected output
npm run build

# Check compiled output structure
ls -la dist/mdsel/

# Expected output:
# dist/mdsel/types.d.ts  - Type declarations (used by IDEs and other TypeScript code)
# dist/mdsel/types.js    - Compiled JavaScript (should be minimal/empty)

# Verify type declarations can be read
cat dist/mdsel/types.d.ts | head -20

# Expected: Should show exported interfaces with type signatures

# Verify that subsequent tasks can use these types
# (This is a smoke test - actual usage will be in P1.M2.T2)
cat > /tmp/future-usage.ts << 'EOF'
// This simulates how P1.M2.T2 will use these types
import { CLIResponse } from './dist/mdsel/types.js';

async function invokeMdsel(): Promise<CLIResponse<unknown>> {
  // Implementation placeholder
  return {} as CLIResponse<unknown>;
}
EOF

npx tsc --noEmit /tmp/future-usage.ts

# Expected: No errors

# Clean up
rm /tmp/future-usage.ts
```

### Level 4: Schema Validation (Domain-Specific)

```bash
# Verify type structure matches mdsel specification exactly
# Compare our types to external_deps.md specification

# Extract key interfaces from our output
grep -A 10 "export interface.*Data" dist/mdsel/types.d.ts

# Extract key interfaces from specification
grep -A 10 "interface.*Data" plan/docs/architecture/external_deps.md

# Manual verification checklist:
echo "Type Structure Verification Checklist:"
echo "[ ] CLIResponse has: success, command, timestamp, data (T|null), partial_results?, unresolved_selectors?, warnings?, errors?"
echo "[ ] ErrorEntry has: type (ErrorType), code, message, file?, selector?, suggestions?"
echo "[ ] ErrorType union has: FILE_NOT_FOUND, PARSE_ERROR, INVALID_SELECTOR, SELECTOR_NOT_FOUND, NAMESPACE_NOT_FOUND, PROCESSING_ERROR?"
echo "[ ] IndexData has: documents (DocumentIndex[]), summary (IndexSummary)?"
echo "[ ] DocumentIndex has: namespace, file_path, root (NodeDescriptor|null), headings (HeadingDescriptor[]), blocks (BlockSummary)?"
echo "[ ] HeadingDescriptor has: selector, type, depth (1-6), text, content_preview, truncated, children_count, word_count, section_word_count, section_truncated?"
echo "[ ] SelectData has: matches (SelectMatch[]), unresolved (string[])?"
echo "[ ] SelectMatch has: selector, type, content, truncated, pagination?, children_available (ChildInfo[])?"

# Field naming convention check (must use snake_case to match mdsel JSON)
echo ""
echo "Field Naming Verification (snake_case):"
echo "[ ] content_preview (not contentPreview)"
echo "[ ] children_count (not childrenCount)"
echo "[ ] word_count (not wordCount)"
echo "[ ] section_word_count (not sectionWordCount)"
echo "[ ] section_truncated (not sectionTruncated)"
echo "[ ] code_blocks (not codeBlocks in BlockSummary)"
echo "[ ] children_available (not childrenAvailable in SelectMatch)"
echo "[ ] file_path (not filePath)"
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] `npm run build` completes with zero errors
- [ ] `npx tsc --noEmit` passes with zero type errors
- [ ] `dist/mdsel/types.d.ts` and `dist/mdsel/types.js` are generated
- [ ] Type usage test imports work without errors

### Feature Validation

- [ ] `CLIResponse<T>` generic wrapper compiles correctly
- [ ] All error types (ErrorEntry, ErrorType union) are present
- [ ] All index command types (IndexData, DocumentIndex, HeadingDescriptor, BlockSummary, IndexSummary) are present
- [ ] All select command types (SelectData, SelectMatch, ChildInfo, PaginationInfo) are present
- [ ] Field names match mdsel JSON exactly (snake_case, not camelCase)
- [ ] Optional fields are marked with `?` (data can be null, some fields optional)

### Code Quality Validation

- [ ] All interfaces use `export` keyword for named imports
- [ ] File placed at `src/mdsel/types.ts` (exact location)
- [ ] No runtime code (only type definitions)
- [ ] No imports in the file (pure type definitions)
- [ ] Follows project's TypeScript configuration (strict mode compatible)

### Documentation & Dependencies

- [ ] Types match `plan/docs/architecture/external_deps.md` specification exactly
- [ ] Task P1.M2.T1.S1 (CLIResponse + error types) completed before P1.M2.T1.S2 (data types)
- [ ] File structure matches `plan/docs/architecture/implementation_notes.md` section 6
- [ ] Enables P1.M2.T2 (CLI invoker can import and use these types)

---

## Anti-Patterns to Avoid

- **Don't use camelCase for mdsel field names**: mdsel uses snake_case (e.g., `content_preview`, `children_available`)
- **Don't make data field non-nullable**: `data: T` is wrong, should be `data: T | null`
- **Don't forget export keywords**: Interfaces need `export` to be importable by other modules
- **Don't add runtime code**: This file is pure type definitions - no functions, no logic, no values
- **Don't use enum for ErrorType**: Use union type `export type ErrorType = 'A' | 'B' | 'C'` instead
- **Don't hardcode heading type as "heading:h1"**: mdsel uses `type: "heading"` with separate `depth` field
- **Don't miss optional fields**: Fields like `pagination?`, `file?`, `selector?` must have `?` modifier
- **Don't add unnecessary imports**: This file defines types, doesn't import from other files
- **Don't place file in wrong location**: Must be at `src/mdsel/types.ts`, not `src/types/mdsel.ts`
- **Don't use .ts extension in imports** (for future tasks importing this file): Use `./types.js` not `./types.ts`

---

## Confidence Score

**8/10** for one-pass implementation success likelihood

**Justification**:
- Exact type specifications provided in `external_deps.md`
- No runtime logic required (pure type definitions)
- Clear file placement and naming conventions
- Comprehensive validation commands to verify correctness

**Remaining Risk**:
- Field naming precision (snake_case vs camelCase) requires attention to detail
- Optional field handling (`?` modifier) must match mdsel behavior exactly
- Generic `CLIResponse<T>` usage may be unfamiliar to some developers

**Mitigation**:
- PRP includes explicit field naming examples
- Validation checklist includes naming convention checks
- External_deps.md is the single source of truth to cross-reference
