from ..core.ner import RELATION_LABELS
from ..utils.logger import setup_logger
from . import create_async_driver

logger = setup_logger(__name__)


class GraphBuilder:
    def __init__(self):
        self._driver = create_async_driver(max_connection_pool_size=10)

    async def close(self) -> None:
        await self._driver.close()

    async def init_schema(self) -> None:
        """Create indexes for performance."""
        async with self._driver.session() as session:
            await session.run("CREATE INDEX entity_text IF NOT EXISTS FOR (e:Entity) ON (e.text)")
            await session.run(
                "CREATE FULLTEXT INDEX entityFulltext IF NOT EXISTS FOR (e:Entity) ON EACH [e.text]"
            )
        logger.info("Graph schema initialized")

    async def ingest_chunk(
        self,
        chunk_id: str,
        doc_id: str,
        entities: list[dict],
        relations: list[dict],
        filename: str,
    ) -> None:
        async with self._driver.session() as session:
            await session.run(
                "MERGE (c:Chunk {id: $id}) SET c.doc_id = $doc_id, c.filename = $filename",
                id=chunk_id,
                doc_id=doc_id,
                filename=filename,
            )

            for entity in entities:
                await session.run(
                    """MERGE (e:Entity {text: $text})
                       ON CREATE SET e.label = $label
                       ON MATCH SET e.label = coalesce(e.label, $label)
                       WITH e
                       MATCH (c:Chunk {id: $chunk_id})
                       MERGE (e)-[:MENTIONED_IN]->(c)""",
                    text=entity["text"].strip(),
                    label=entity["label"],
                    chunk_id=chunk_id,
                )

            for relation in relations:
                predicate = relation["predicate"].upper().replace(" ", "_")
                if predicate not in RELATION_LABELS:
                    continue
                cypher = f"""
                MERGE (s:Entity {{text: $subj}})
                MERGE (o:Entity {{text: $obj}})
                MERGE (s)-[r:{predicate}]->(o)
                SET r.doc_id = $doc_id
                """
                await session.run(
                    cypher,
                    subj=relation["subject"].strip(),
                    obj=relation["object"].strip(),
                    doc_id=doc_id,
                )
