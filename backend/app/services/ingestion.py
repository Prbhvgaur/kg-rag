import asyncio
import uuid
from typing import Dict, Any
from .schemas import IngestionSteps, StepStatus

# In-memory job store
jobs: Dict[str, Any] = {}

class IngestionStep:
    EXTRACT = "pdf_extraction"
    CHUNK = "chunking"
    NER = "ner_embedding"
    GRAPH = "graph_storage"
    VECTOR = "vector_indexing"
    DONE = "complete"

async def run_ingestion_pipeline(job_id: str, file_bytes: bytes, user_id: str):
    """
    Run each step and update jobs[job_id] status after each step.
    Frontend polls /api/status/{job_id} to see progress.
    """
    jobs[job_id]["status"] = "running"
    
    try:
        # Step 1: PDF extraction
        jobs[job_id]["steps"].pdf_extraction = StepStatus.IN_PROGRESS
        await asyncio.sleep(1) # Simulate work
        jobs[job_id]["steps"].pdf_extraction = StepStatus.COMPLETE
        
        # Step 2: Chunking
        jobs[job_id]["steps"].chunking = StepStatus.IN_PROGRESS
        await asyncio.sleep(1)
        jobs[job_id]["steps"].chunking = StepStatus.COMPLETE
        
        # Step 3: NER + Embedding (concurrent)
        jobs[job_id]["steps"].ner_embedding = StepStatus.IN_PROGRESS
        await asyncio.sleep(2)
        jobs[job_id]["steps"].ner_embedding = StepStatus.COMPLETE
        
        # Step 4: Store in Neo4j
        jobs[job_id]["steps"].graph_storage = StepStatus.IN_PROGRESS
        await asyncio.sleep(1)
        jobs[job_id]["steps"].graph_storage = StepStatus.COMPLETE
        
        # Step 5: Index in pgvector
        jobs[job_id]["steps"].vector_indexing = StepStatus.IN_PROGRESS
        await asyncio.sleep(1)
        jobs[job_id]["steps"].vector_indexing = StepStatus.COMPLETE
        
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result"] = {
            "chunk_count": 42, # Mock results
            "entity_count": 15,
            "document_id": str(uuid.uuid4())
        }
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        # Update current pending steps to error if needed
        raise
