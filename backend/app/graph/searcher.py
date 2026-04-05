from ..utils.logger import setup_logger
from . import create_async_driver

logger = setup_logger(__name__)


class GraphSearcher:
    def __init__(self):
        self._driver = create_async_driver(max_connection_pool_size=10)

    async def close(self) -> None:
        await self._driver.close()

    async def find_entities_in_question(self, question: str) -> list[dict]:
        """Full-text search for entities matching words in the question."""
        words = [word for word in question.split() if len(word) > 3]
        if not words:
            return []
        lucene_query = " OR ".join(words[:10])

        async with self._driver.session() as session:
            result = await session.run(
                """CALL db.index.fulltext.queryNodes('entityFulltext', $query)
                   YIELD node, score
                   WHERE score > 0.3
                   RETURN node.text AS text, node.label AS label, score
                   ORDER BY score DESC
                   LIMIT 10""",
                {"query": lucene_query},
            )
            return await result.data()

    async def traverse(
        self,
        entity_text: str,
        max_hops: int = 2,
        limit: int = 50,
    ) -> list[dict]:
        """Traverse outward from an entity and return subject-predicate-object facts."""
        max_hops = max(1, min(max_hops, 3))
        async with self._driver.session() as session:
            query = (
                f"MATCH path = (start:Entity {{text: $name}})-[*1..{max_hops}]-(end:Entity) "
                "UNWIND relationships(path) AS rel "
                "RETURN startNode(rel).text AS subject, "
                "type(rel) AS predicate, "
                "endNode(rel).text AS object "
                "LIMIT $limit"
            )
            result = await session.run(query, name=entity_text, limit=limit)
            return await result.data()

    async def get_full_graph(self, limit: int = 200) -> dict:
        """Return graph nodes and edges for visualization."""
        async with self._driver.session() as session:
            result = await session.run(
                """MATCH (e:Entity)-[r]->(e2:Entity)
                   RETURN e.text AS source, e.label AS source_label,
                          type(r) AS relation,
                          e2.text AS target, e2.label AS target_label
                   LIMIT $limit""",
                limit=limit,
            )
            records = await result.data()

        nodes_map: dict[str, dict] = {}
        links: list[dict] = []
        for record in records:
            for key, label in (
                (record["source"], record["source_label"]),
                (record["target"], record["target_label"]),
            ):
                if key not in nodes_map:
                    nodes_map[key] = {"id": key, "label": label, "name": key}
            links.append(
                {
                    "source": record["source"],
                    "target": record["target"],
                    "relation": record["relation"],
                }
            )

        return {"nodes": list(nodes_map.values()), "links": links}
