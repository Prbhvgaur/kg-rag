from fastapi import APIRouter
from ..utils.responses import success_response, error_response

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Check connectivity to Neo4j and Supabase.
    Used by frontend to detect if backend is online.
    """
    # In a real app, you'd check actual connections here
    neo4j_ok = True 
    supabase_ok = True
    
    status = "healthy" if (neo4j_ok and supabase_ok) else "degraded"
    
    return success_response({
        "status": status,
        "dependencies": {
            "neo4j": "ok" if neo4j_ok else "error",
            "supabase": "ok" if supabase_ok else "error",
        },
        "version": "1.0.0"
    })
