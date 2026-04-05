from __future__ import annotations

import asyncio
import uuid
from typing import AsyncGenerator
from typing import TYPE_CHECKING

from fastapi import UploadFile

from ..config import get_settings
from ..core.embeddings import embed_text
from ..core.ner import extract_entities, extract_relations
from ..utils.logger import setup_logger
from .chunker import chunk_text
from .extractor import extract_text

if TYPE_CHECKING:
    from ..graph.builder import GraphBuilder
    from ..vector.store import VectorStore

logger = setup_logger(__name__)
settings = get_settings()


async def ingest_document(
    file: UploadFile,
    graph_builder: GraphBuilder,
    vector_store: VectorStore,
) -> AsyncGenerator[dict, None]:
    """
    Full ingestion pipeline. Yields SSE-compatible progress events.
    Stages: extract -> chunk -> process -> done
    """
    doc_id = str(uuid.uuid4())

    yield {"stage": "extracting", "progress": 5, "message": "Extracting text from file"}
    text, filename = await extract_text(file)

    yield {"stage": "chunking", "progress": 15, "message": "Splitting into chunks"}
    chunks = chunk_text(text)

    if not chunks:
        raise ValueError("No valid chunks were created from the uploaded file")

    if len(chunks) > settings.max_chunks_per_doc:
        chunks = chunks[: settings.max_chunks_per_doc]
        logger.warning("Truncated document to %s chunks", settings.max_chunks_per_doc)

    total = len(chunks)
    yield {"stage": "chunking", "progress": 20, "message": f"Created {total} chunks"}

    for index, chunk in enumerate(chunks):
        progress = 20 + int(((index + 1) / total) * 60)
        yield {
            "stage": "processing",
            "progress": progress,
            "message": f"Processing chunk {index + 1}/{total}",
        }

        chunk_id = f"{doc_id}_chunk_{index}"

        embedding, entities = await asyncio.gather(
            embed_text(chunk, task_type="RETRIEVAL_DOCUMENT", title=filename),
            extract_entities(chunk),
        )

        await vector_store.upsert_chunk(
            chunk_id=chunk_id,
            doc_id=doc_id,
            text=chunk,
            embedding=embedding,
            filename=filename,
        )

        if entities:
            relations = await extract_relations(chunk, entities)
            await graph_builder.ingest_chunk(
                chunk_id=chunk_id,
                doc_id=doc_id,
                entities=entities,
                relations=relations,
                filename=filename,
            )

        await asyncio.sleep(0.5)

    yield {
        "stage": "done",
        "progress": 100,
        "doc_id": doc_id,
        "filename": filename,
        "chunks": total,
        "message": "Ingestion complete",
    }
