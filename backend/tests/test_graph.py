import unittest

from app.utils.sanitizer import sanitize_filename, sanitize_query, validate_mime_type


class GraphTests(unittest.TestCase):
    def test_sanitize_filename(self):
        self.assertEqual(sanitize_filename("../unsafe?.pdf"), "unsafe.pdf")

    def test_sanitize_query_rejects_empty(self):
        with self.assertRaises(ValueError):
            sanitize_query("   ")

    def test_validate_mime_type(self):
        self.assertTrue(validate_mime_type("application/pdf"))
        self.assertFalse(validate_mime_type("application/json"))
