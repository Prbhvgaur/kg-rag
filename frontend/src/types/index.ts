export interface IngestEvent {
  stage: "extracting" | "chunking" | "processing" | "done" | "error";
  progress: number;
  message: string;
  doc_id?: string;
  filename?: string;
  chunks?: number;
}

export interface Source {
  filename: string;
  text: string;
  score: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  entities_matched: string[];
  graph_facts_used: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  entities?: string[];
  graphFacts?: number;
  timestamp: string;
}

export interface GraphNode {
  id: string;
  label: string;
  name: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Document {
  doc_id: string;
  filename: string;
  chunks: number;
  ingestedAt: string;
}
