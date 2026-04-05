from pydantic import BaseModel


class IngestResponse(BaseModel):
    doc_id: str
    filename: str
    chunks: int
    message: str
