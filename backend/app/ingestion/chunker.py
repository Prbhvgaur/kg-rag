from ..utils.logger import setup_logger

logger = setup_logger(__name__)


def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 150,
) -> list[str]:
    """
    Sliding-window chunker with sentence-boundary awareness.
    Splits at sentence boundaries when a good boundary exists near the end.
    """
    if not text or not text.strip():
        return []

    normalized = " ".join(text.split())
    chunks: list[str] = []
    start = 0
    text_length = len(normalized)

    while start < text_length:
        end = min(start + chunk_size, text_length)

        if end < text_length:
            for punctuation in (". ", "! ", "? ", "\n"):
                boundary = normalized.rfind(punctuation, start + chunk_size // 2, end)
                if boundary != -1:
                    end = boundary + len(punctuation)
                    break

        chunk = normalized[start:end].strip()
        if chunk and len(chunk) > 50:
            chunks.append(chunk)

        if end >= text_length:
            break
        start = max(end - overlap, start + 1)

    logger.info("Chunked text into %s chunks", len(chunks))
    return chunks
