import asyncio
import math

from google.genai import types

from .gemini import _rate_limiter, get_client, normalize_gemini_exception
from ..utils.logger import setup_logger

logger = setup_logger(__name__)
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIM = 768


def _normalize_embedding(values: list[float]) -> list[float]:
    magnitude = math.sqrt(sum(value * value for value in values))
    if magnitude == 0:
        return values
    return [value / magnitude for value in values]


async def embed_text(
    text: str,
    task_type: str = "SEMANTIC_SIMILARITY",
    title: str | None = None,
) -> list[float]:
    """Generate a normalized 768-dimension embedding via Gemini Embedding."""
    await _rate_limiter.wait()
    client = get_client()
    try:
        config = types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIM,
            task_type=task_type,
        )
        if title and task_type == "RETRIEVAL_DOCUMENT":
            config.title = title

        result = await asyncio.to_thread(
            client.models.embed_content,
            model=EMBEDDING_MODEL,
            contents=text,
            config=config,
        )
        return _normalize_embedding(result.embeddings[0].values)
    except Exception as exc:
        logger.error("Embedding error: %s", exc)
        raise normalize_gemini_exception(exc) from exc


async def embed_batch(texts: list[str], batch_size: int = 5) -> list[list[float]]:
    """Embed multiple texts with small batches to stay under rate limits."""
    embeddings: list[list[float]] = []
    for index in range(0, len(texts), batch_size):
        batch = texts[index : index + batch_size]
        results = await asyncio.gather(*(embed_text(text) for text in batch))
        embeddings.extend(results)
    return embeddings
