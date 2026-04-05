import io
import unittest

from fastapi import UploadFile

from app.ingestion.chunker import chunk_text
from app.ingestion.extractor import extract_text_from_txt


class ChunkerTests(unittest.IsolatedAsyncioTestCase):
    def test_chunk_text_returns_chunks(self):
        text = "Sentence one. " * 200
        chunks = chunk_text(text, chunk_size=120, overlap=20)
        self.assertGreater(len(chunks), 1)
        self.assertTrue(all(chunk.strip() for chunk in chunks))

    async def test_extract_text_from_txt(self):
        file = UploadFile(filename="notes.txt", file=io.BytesIO(b"hello world"))
        file.headers = {"content-type": "text/plain"}
        text, filename = await extract_text_from_txt(file)
        self.assertEqual(text, "hello world")
        self.assertEqual(filename, "notes.txt")
