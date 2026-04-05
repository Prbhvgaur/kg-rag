from pydantic import BaseModel, field_validator

from ...utils.sanitizer import sanitize_query


class QueryRequest(BaseModel):
    question: str
    max_hops: int = 2
    top_k: int = 5

    @field_validator("question")
    @classmethod
    def clean_question(cls, value: str) -> str:
        return sanitize_query(value)

    @field_validator("max_hops")
    @classmethod
    def clamp_hops(cls, value: int) -> int:
        return max(1, min(value, 3))

    @field_validator("top_k")
    @classmethod
    def clamp_top_k(cls, value: int) -> int:
        return max(1, min(value, 10))


class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    entities_matched: list[str]
    graph_facts_used: int
