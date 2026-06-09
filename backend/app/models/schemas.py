from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    ERROR = "error"

class IngestionSteps(BaseModel):
    pdf_extraction: StepStatus = StepStatus.PENDING
    chunking: StepStatus = StepStatus.PENDING
    ner_embedding: StepStatus = StepStatus.PENDING
    graph_storage: StepStatus = StepStatus.PENDING
    vector_indexing: StepStatus = StepStatus.PENDING

class IngestionJob(BaseModel):
    job_id: str
    status: str
    steps: IngestionSteps
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class QueryRequest(BaseModel):
    question: str

class SourceChunk(BaseModel):
    text: str
    score: float
    document_name: str
    chunk_index: int

class GraphEdge(BaseModel):
    from_node: str
    to_node: str
    relation: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    graph_path: Optional[List[GraphEdge]] = None
    latency_ms: int
    query_id: str

class DocumentResponse(BaseModel):
    id: str
    name: str
    size_bytes: int
    chunk_count: int
    entity_count: int
    status: str
    created_at: str
    user_id: str
