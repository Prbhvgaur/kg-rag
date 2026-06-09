import asyncio
import threading
from urllib.parse import parse_qsl, unquote

import psycopg2
from pgvector.psycopg2 import register_vector

from ..config import get_settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

INIT_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chunks (
    id          TEXT PRIMARY KEY,
    doc_id      TEXT NOT NULL,
    user_id     TEXT NOT NULL DEFAULT 'legacy',
    filename    TEXT NOT NULL,
    text        TEXT NOT NULL,
    embedding   vector(768),
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chunks ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'legacy';

CREATE INDEX IF NOT EXISTS chunks_doc_idx ON chunks(doc_id);
CREATE INDEX IF NOT EXISTS chunks_user_idx ON chunks(user_id);
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
    ON chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
"""


class VectorStore:
    def __init__(self):
        settings = get_settings()
        self._conn_str = settings.supabase_db_url
        self._schema_initialized = False
        self._schema_lock = threading.Lock()

    def _connect(self, register: bool = True):
        conn = psycopg2.connect(**self._build_conn_kwargs(self._conn_str))
        with conn.cursor() as cur:
            cur.execute("SET search_path TO public, extensions")
        conn.commit()
        if register:
            register_vector(conn)
        return conn

    def _get_conn(self):
        self._ensure_schema()
        return self._connect(register=True)

    @staticmethod
    def _build_conn_kwargs(conn_str: str) -> dict:
        """Parse a Postgres DSN while tolerating unescaped '@' in passwords."""
        if not conn_str.startswith(("postgresql://", "postgres://")):
            return {"dsn": conn_str}

        scheme, body = conn_str.split("://", 1)
        query = ""
        if "?" in body:
            body, query = body.split("?", 1)

        auth_and_host, database = body.rsplit("/", 1)
        auth, hostport = auth_and_host.rsplit("@", 1)
        user, password = auth.split(":", 1)

        if ":" in hostport:
            host, port = hostport.rsplit(":", 1)
        else:
            host, port = hostport, "5432"

        kwargs = {
            "user": unquote(user),
            "password": unquote(password),
            "host": host,
            "port": int(port),
            "dbname": unquote(database),
        }
        if query:
            kwargs.update({key: value for key, value in parse_qsl(query)})
        return kwargs

    def init_schema(self) -> None:
        with self._connect(register=False) as conn:
            with conn.cursor() as cur:
                cur.execute(INIT_SQL)
            conn.commit()
        self._schema_initialized = True
        logger.info("Vector store schema initialized")

    def _ensure_schema(self) -> None:
        if self._schema_initialized:
            return

        with self._schema_lock:
            if self._schema_initialized:
                return
            self.init_schema()

    async def upsert_chunk(
        self,
        chunk_id: str,
        doc_id: str,
        text: str,
        embedding: list[float],
        filename: str,
        user_id: str = "legacy",
    ) -> None:
        await asyncio.to_thread(
            self._upsert_chunk_sync,
            chunk_id,
            doc_id,
            text,
            embedding,
            filename,
            user_id,
        )

    def _upsert_chunk_sync(
        self,
        chunk_id: str,
        doc_id: str,
        text: str,
        embedding: list[float],
        filename: str,
        user_id: str,
    ) -> None:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO chunks (id, doc_id, user_id, filename, text, embedding)
                       VALUES (%s, %s, %s, %s, %s, %s)
                       ON CONFLICT (id) DO UPDATE
                       SET user_id = EXCLUDED.user_id,
                           filename = EXCLUDED.filename,
                           text = EXCLUDED.text,
                           embedding = EXCLUDED.embedding""",
                    (chunk_id, doc_id, user_id, filename, text, embedding),
                )
            conn.commit()

    async def list_documents(self, user_id: str) -> list[dict]:
        return await asyncio.to_thread(self._list_documents_sync, user_id)

    def _list_documents_sync(self, user_id: str) -> list[dict]:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """SELECT doc_id, filename, count(*) AS chunk_count, min(created_at) AS created_at
                       FROM chunks
                       WHERE user_id = %s
                       GROUP BY doc_id, filename
                       ORDER BY min(created_at) DESC""",
                    (user_id,),
                )
                rows = cur.fetchall()
        return [
            {
                "id": row[0],
                "name": row[1],
                "size_bytes": 0,
                "chunk_count": int(row[2]),
                "entity_count": 0,
                "status": "ready",
                "created_at": row[3].isoformat() if row[3] else "",
                "user_id": user_id,
            }
            for row in rows
        ]

    async def delete_document(self, doc_id: str, user_id: str) -> bool:
        return await asyncio.to_thread(self._delete_document_sync, doc_id, user_id)

    def _delete_document_sync(self, doc_id: str, user_id: str) -> bool:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM chunks WHERE doc_id = %s AND user_id = %s", (doc_id, user_id))
                deleted = cur.rowcount > 0
            conn.commit()
        return deleted

    async def similarity_search(
        self,
        embedding: list[float],
        top_k: int = 5,
        doc_ids: list[str] | None = None,
        user_id: str | None = None,
    ) -> list[dict]:
        return await asyncio.to_thread(
            self._similarity_search_sync,
            embedding,
            top_k,
            doc_ids,
            user_id,
        )

    def _similarity_search_sync(
        self,
        embedding: list[float],
        top_k: int,
        doc_ids: list[str] | None,
        user_id: str | None,
    ) -> list[dict]:
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                if doc_ids:
                    cur.execute(
                        """SELECT id, doc_id, filename, text,
                                  1 - (embedding <=> %s::vector) AS score
                           FROM chunks
                           WHERE doc_id = ANY(%s)
                             AND (%s IS NULL OR user_id = %s)
                           ORDER BY embedding <=> %s::vector
                           LIMIT %s""",
                        (embedding, doc_ids, user_id, user_id, embedding, top_k),
                    )
                else:
                    cur.execute(
                        """SELECT id, doc_id, filename, text,
                                  1 - (embedding <=> %s::vector) AS score
                           FROM chunks
                           WHERE (%s IS NULL OR user_id = %s)
                           ORDER BY embedding <=> %s::vector
                           LIMIT %s""",
                        (embedding, user_id, user_id, embedding, top_k),
                    )
                rows = cur.fetchall()

        return [
            {
                "id": row[0],
                "doc_id": row[1],
                "filename": row[2],
                "text": row[3],
                "score": float(row[4]),
            }
            for row in rows
        ]
