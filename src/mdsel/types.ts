// mdsel CLI Response Type Definitions
// This file contains TypeScript interfaces matching mdsel 1.0.0 JSON output exactly.

// Generic wrapper for all mdsel CLI responses
export interface CLIResponse<T> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;
  data: T | null;
  partial_results?: unknown[];
  unresolved_selectors?: string[];
  warnings?: string[];
  errors?: ErrorEntry[];
}

// Error handling types
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

// Index command types
export interface IndexData {
  documents: DocumentIndex[];
  summary: IndexSummary;
}

export interface DocumentIndex {
  namespace: string;
  file_path: string;
  root: NodeDescriptor | null;
  headings: HeadingDescriptor[];
  blocks: BlockSummary;
}

export interface HeadingDescriptor {
  selector: string;
  type: string;
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
  section_word_count: number;
  section_truncated: boolean;
}

export interface BlockSummary {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}

export interface IndexSummary {
  total_documents: number;
  total_nodes: number;
  total_selectors: number;
}

export interface NodeDescriptor {
  [key: string]: unknown;
}

// Select command types
export interface SelectData {
  matches: SelectMatch[];
  unresolved: string[];
}

export interface SelectMatch {
  selector: string;
  type: string;
  content: string;
  truncated: boolean;
  pagination?: PaginationInfo;
  children_available: ChildInfo[];
}

export interface ChildInfo {
  selector: string;
  type: string;
  preview: string;
}

export interface PaginationInfo {
  [key: string]: unknown;
}
