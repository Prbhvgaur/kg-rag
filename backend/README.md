# KG-RAG Backend

FastAPI service for document ingestion, vector retrieval, graph traversal, and Gemini-powered answer synthesis.

## Setup

```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Notes

- Configure Gemini, Neo4j AuraDB, and Supabase credentials in `.env`.
- Run schema initialization once before first ingestion.
- `/docs` is available only when `ENVIRONMENT=development`.
- The backend now installs cleanly on Python 3.13 in addition to the original Python 3.11 target by using wheel-backed versions of `psycopg2-binary`, `pydantic`, and `pydantic-settings`.
- The Neo4j driver is pinned to a newer 5.x release for better Python 3.13 compatibility.
- The runtime uses the Supabase Postgres connection string in `SUPABASE_DB_URL` directly, so the unused Python `supabase` client dependency was removed.
- Supabase direct Postgres hosts (`db.<project-ref>.supabase.co:5432`) are IPv6-only by default. If your local network does not support IPv6, use the Supavisor Session pooler connection string from the Supabase dashboard `Connect` panel instead.
