import html
import re

MAX_QUERY_LENGTH = 1000
MAX_DOC_NAME_LENGTH = 200
ALLOWED_MIME_TYPES = {"application/pdf", "text/plain"}


def sanitize_query(text: str) -> str:
    """Strip HTML, limit length, remove control characters."""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = text.strip()
    if len(text) > MAX_QUERY_LENGTH:
        raise ValueError(f"Query exceeds {MAX_QUERY_LENGTH} characters")
    if not text:
        raise ValueError("Query cannot be empty")
    return text


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^\w\s\-.]", "", name)
    name = name.strip(". ")
    return name[:MAX_DOC_NAME_LENGTH] or "document"


def validate_mime_type(content_type: str) -> bool:
    return content_type in ALLOWED_MIME_TYPES
