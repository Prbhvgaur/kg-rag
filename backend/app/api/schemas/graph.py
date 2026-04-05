from pydantic import BaseModel


class GraphNode(BaseModel):
    id: str
    label: str | None = None
    name: str


class GraphLink(BaseModel):
    source: str
    target: str
    relation: str


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
