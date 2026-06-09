export interface User {
  id: string
  email: string
  created_at: string
}

export interface KGDocument {
  id: string
  name: string
  size_bytes: number
  chunk_count: number
  entity_count: number
  status: 'ingesting' | 'ready' | 'error'
  created_at: string
  user_id: string
}

export interface IngestionJob {
  job_id: string
  status: 'running' | 'complete' | 'error'
  steps: {
    pdf_extraction: StepStatus
    chunking: StepStatus
    ner_embedding: StepStatus
    graph_storage: StepStatus
    vector_indexing: StepStatus
  }
  result?: {
    chunk_count: number
    entity_count: number
    document_id: string
  }
  error?: string
}

export type StepStatus = 'pending' | 'in_progress' | 'complete' | 'error'

export interface QueryResult {
  answer: string
  sources: SourceChunk[]
  graph_path?: GraphEdge[]
  latency_ms: number
  query_id: string
}

export interface SourceChunk {
  text: string
  score: number
  document_name: string
  chunk_index: number
}

export interface GraphEdge {
  from: string
  to: string
  relation: string
}

export interface GraphNode {
  id: string
  label: string
  type: 'PERSON' | 'ORG' | 'CONCEPT' | 'LOCATION' | 'EVENT'
  properties: Record<string, string>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  request_id?: string
}
