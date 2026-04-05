import io
from pathlib import Path

import pdfplumber
from fastapi import UploadFile

from ..utils.logger import setup_logger
from ..utils.sanitizer import sanitize_filename

logger = setup_logger(__name__)
MAX_PAGES = 200


async def extract_text(file: UploadFile) -> tuple[str, str]:
    """Extract text from PDF or TXT uploads."""
    filename = file.filename or "document"
    suffix = Path(filename).suffix.lower()
    content_type = file.content_type or ""

    if suffix == ".txt" or content_type == "text/plain":
        return await extract_text_from_txt(file)
    return await extract_text_from_pdf(file)


async def extract_text_from_pdf(file: UploadFile) -> tuple[str, str]:
    """
    Extract text from PDF. Returns (text, safe_filename).
    Raises ValueError on invalid or empty files.
    """
    safe_name = sanitize_filename(file.filename or "document.pdf")
    content = await file.read()

    if not content:
        raise ValueError("Uploaded file is empty")

    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            if len(pdf.pages) > MAX_PAGES:
                raise ValueError(f"PDF exceeds {MAX_PAGES} page limit")

            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text.strip())

            full_text = "\n\n".join(pages_text)
            if not full_text.strip():
                raise ValueError("No extractable text found in PDF")

            logger.info("Extracted %s chars from %s pages", len(full_text), len(pdf.pages))
            return full_text, safe_name
    except pdfplumber.pdfminer.pdfparser.PDFSyntaxError as exc:
        raise ValueError("Invalid or corrupted PDF file") from exc


async def extract_text_from_txt(file: UploadFile) -> tuple[str, str]:
    safe_name = sanitize_filename(file.filename or "document.txt")
    content = await file.read()

    if not content:
        raise ValueError("Uploaded file is empty")

    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise ValueError("No extractable text found in text file")

    logger.info("Extracted %s chars from text file", len(text))
    return text, safe_name
