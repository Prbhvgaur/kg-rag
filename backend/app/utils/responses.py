from fastapi import HTTPException

def success_response(data: dict, request_id: str = None):
    return {"success": True, "data": data, "request_id": request_id}

def error_response(message: str, code: str, status_code: int = 400):
    raise HTTPException(
        status_code=status_code, 
        detail={"success": False, "error": message, "code": code}
    )
