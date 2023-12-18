interface ToolCall {
  id: string;
  type: string; // For now, always 'function'
  function: {
    name: string;
    arguments: string;
  };
}

interface RequiredAction {
  type: string; // Always 'submit_tool_outputs'
  submit_tool_outputs: {
    tool_calls: ToolCall[];
  };
}

interface LastError {
  code: string; // 'server_error' or 'rate_limit_exceeded'
  message: string;
}

interface Metadata {
  [key: string]: string; // Key max 64 chars, Value max 512 chars
}

interface Tool {
  type: 'code_interpreter' | 'retrieval' | 'function';
  function?: {
    description: string;
    name: string; // a-z, A-Z, 0-9, underscores, dashes, max 64 chars
    parameters: any; // Described as a JSON Schema object
  };
}

export interface Assistant {
  id: string;
  object: string; // Always 'assistant'
  created_at: number; // Unix timestamp in seconds
  name: string | null; // Max length 256 characters
  description: string | null; // Max length 512 characters
  model: string; // ID of the model to use
  instructions: string | null; // Max length 32768 characters
  tools: Tool[]; // Max of 128 tools per assistant
  file_ids: string[]; // Max of 20 files, ordered by creation date
  metadata: Metadata;
}

export interface Run {
  id: string;
  object: string; // Always 'thread.run'
  created_at: number; // Unix timestamp in seconds
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';
  required_action: RequiredAction | null;
  last_error: LastError | null;
  expires_at: number; // Unix timestamp in seconds
  started_at: number | null; // Unix timestamp in seconds
  cancelled_at: number | null; // Unix timestamp in seconds
  failed_at: number | null; // Unix timestamp in seconds
  completed_at: number | null; // Unix timestamp in seconds
  model: string;
  instructions: string;
  tools: Tool[]; // List of tools used
  file_ids: string[]; // List of File IDs used
  metadata: Metadata;
}

interface ImageFileContent {
  type: 'image_file';
  image_file: {
    file_id: string;
  };
}

interface TextContent {
  type: 'text';
  text: {
    value: string;
  };
}

interface FileCitationAnnotation {
  type: 'file_citation';
  text: string;
  file_citation: {
    start_index: number;
    end_index: number;
  };
}

interface FilePathAnnotation {
  type: 'file_path';
  text: string;
  file_path: {
    file_id: string;
    start_index: number;
    end_index: number;
  };
}

type Content = ImageFileContent | TextContent;
type Annotation = FileCitationAnnotation | FilePathAnnotation;

export interface Message {
  id: string;
  object: string; // Always 'thread.message'
  created_at: number; // Unix timestamp in seconds
  thread_id: string;
  role: 'user' | 'assistant';
  content: Content[];
  annotations?: Annotation[];
  assistant_id: string | null;
  run_id: string | null;
  file_ids: string[]; // Max of 10 files
  metadata: Metadata;
}