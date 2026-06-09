from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from ..middleware.auth import get_current_user
from ..middleware.rate_limit import limiter
from ..services.ingestion import run_ingestion_pipeline, jobs
from ..models.schemas import IngestionSteps, IngestionJob
from ..utils.responses import success_response, error_response
import uuid
from fastapi import Request

router = APIRouter(prefix="/api")

@router.post("/ingest")
@limiter.limit("5/minute")
async def ingest_document(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if not file.filename.endswith('.pdf'):
        return error_response("Only PDF files are supported", "INVALID_FILE_TYPE", 400)
    
    job_id = str(uuid.uuid4())
    file_bytes = await file.read()
    
    # Initialize job state
    jobs[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "steps": IngestionSteps(),
        "user_id": user["user_id"],
        "created_at": uuid.uuid4() # Mock timestamp
    }
    
    background_tasks.add_task(run_ingestion_pipeline, job_id, file_bytes, user["user_id"])
    
    return success_response({"job_id": job_id})

@router.get("/status/{job_id}")
async def get_job_status(job_id: str, user=Depends(get_current_user)):
    job = jobs.get(job_id)
    if not job:
        return error_response("Job not found", "NOT_FOUND", 404)
    if job["user_id"] != user["user_id"]:
        return error_response("Access denied", "FORBIDDEN", 403)
    return success_response(job)

@router.get("/documents")
async def list_documents(user=Depends(get_current_user)):
    # Mock document list
    return success_response([])

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, user=Depends(get_current_user)):
    return success_response({"deleted": doc_id})
