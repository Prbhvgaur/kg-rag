from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

from ..core.embeddings import embed_text
from ..core.gemini import call_gemini
from ..utils.logger import setup_logger

if TYPE_CHECKING:
    from ..graph.searcher import GraphSearcher
    from ..vector.store import VectorStore

logger = setup_logger(__name__)

SYSTEM_PROMPT = """You are a precise knowledge assistant. Answer questions using ONLY
the provided context (document excerpts and graph facts). If the context does not contain
enough information, say so clearly. Cite which source supports each claim whenever possible.
Be concise and factual."""


class QueryEngine:
    def __init__(self, vector_store: VectorStore, graph_searcher: GraphSearcher):
        self.vector = vector_store
        self.graph = graph_searcher

    async def query(
        self,
        question: str,
        max_hops: int = 2,
        top_k: int = 5,
        user_id: str | None = None,
    ) -> dict:
        q_embedding = await embed_text(question, task_type="RETRIEVAL_QUERY")

        seed_chunks, entities = await asyncio.gather(
            self.vector.similarity_search(q_embedding, top_k=top_k, user_id=user_id),
            self.graph.find_entities_in_question(question, user_id=user_id),
        )

        graph_facts: list[dict] = []
        traversal_tasks = [
            self.graph.traverse(entity["text"], max_hops=max_hops, user_id=user_id)
            for entity in entities[:5]
        ]
        if traversal_tasks:
            results = await asyncio.gather(*traversal_tasks)
            for result in results:
                graph_facts.extend(result)

        seen: set[tuple[str, str, str]] = set()
        unique_facts: list[dict] = []
        for fact in graph_facts:
            key = (fact["subject"], fact["predicate"], fact["object"])
            if key not in seen:
                seen.add(key)
                unique_facts.append(fact)

        context = _build_context(seed_chunks, unique_facts[:50])
        prompt = f"Context:\n{context}\n\nQuestion: {question}"
        answer = await call_gemini(
            prompt=prompt,
            system=SYSTEM_PROMPT,
            temperature=0.1,
            max_tokens=1024,
        )

        return {
            "answer": answer,
            "sources": [
                {
                    "filename": chunk["filename"],
                    "document_name": chunk["filename"],
                    "text": chunk["text"][:200],
                    "score": chunk["score"],
                    "chunk_index": _chunk_index(chunk["id"]),
                }
                for chunk in seed_chunks
            ],
            "entities_matched": [entity["text"] for entity in entities],
            "graph_facts_used": len(unique_facts),
            "graph_path": [
                {"from": fact["subject"], "to": fact["object"], "relation": fact["predicate"]}
                for fact in unique_facts[:8]
            ],
        }


def _build_context(chunks: list[dict], facts: list[dict]) -> str:
    chunk_text = "\n---\n".join(f"[{chunk['filename']}] {chunk['text']}" for chunk in chunks)
    fact_text = (
        "\n".join(f"- {fact['subject']} {fact['predicate']} {fact['object']}" for fact in facts)
        if facts
        else "No graph facts found."
    )
    return f"Document excerpts:\n{chunk_text}\n\nKnowledge graph facts:\n{fact_text}"


def _chunk_index(chunk_id: str) -> int:
    try:
        return int(chunk_id.rsplit("_chunk_", 1)[1])
    except (IndexError, ValueError):
        return 0
