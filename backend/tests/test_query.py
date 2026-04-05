import unittest

from app.api.schemas.query import QueryRequest
from app.query.engine import _build_context


class QueryTests(unittest.TestCase):
    def test_query_request_sanitizes_and_clamps(self):
        request = QueryRequest(question=" <b>What is AI?</b> ", max_hops=99, top_k=0)
        self.assertEqual(request.question, "What is AI?")
        self.assertEqual(request.max_hops, 3)
        self.assertEqual(request.top_k, 1)

    def test_build_context_contains_chunks_and_facts(self):
        context = _build_context(
            [{"filename": "doc.pdf", "text": "Alpha", "score": 0.9}],
            [{"subject": "A", "predicate": "RELATED_TO", "object": "B"}],
        )
        self.assertIn("doc.pdf", context)
        self.assertIn("A RELATED_TO B", context)
