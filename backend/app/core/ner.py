import json

from .gemini import call_gemini
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

ENTITY_LABELS = [
    "PERSON",
    "ORGANIZATION",
    "LOCATION",
    "PRODUCT",
    "DRUG",
    "DISEASE",
    "TECHNOLOGY",
    "EVENT",
    "CONCEPT",
]

RELATION_LABELS = {
    "TREATS",
    "CAUSES",
    "PART_OF",
    "RELATED_TO",
    "DEVELOPS",
    "LOCATED_IN",
    "WORKS_FOR",
    "COMPETES_WITH",
    "USES",
    "FOUNDED_BY",
}


async def extract_entities(text: str) -> list[dict]:
    """Extract named entities using Gemini. Returns [{'text', 'label'}]."""
    prompt = f"""Extract named entities from the text below.
Return ONLY a valid JSON array. No explanation, no markdown.
Format: [{{"text": "entity name", "label": "ENTITY_TYPE"}}]
Valid labels: {", ".join(ENTITY_LABELS)}
Only include entities clearly present in the text.

Text: {text[:1500]}"""

    try:
        raw = await call_gemini(prompt, temperature=0, json_mode=True)
        entities = json.loads(raw)
        return [
            entity
            for entity in entities
            if isinstance(entity, dict)
            and "text" in entity
            and "label" in entity
            and entity["label"] in ENTITY_LABELS
            and isinstance(entity["text"], str)
            and len(entity["text"]) <= 200
        ]
    except (json.JSONDecodeError, TypeError, ValueError, Exception) as exc:
        logger.warning("NER parse error: %s. Returning empty list.", exc)
        return []


async def extract_relations(text: str, entities: list[dict]) -> list[dict]:
    """Extract relationships between entities."""
    if len(entities) < 2:
        return []

    entity_list = "\n".join(f"- {entity['label']}: {entity['text']}" for entity in entities[:20])
    prompt = f"""Given these entities found in the text, identify relationships.
Return ONLY a valid JSON array. No explanation.
Format: [{{"subject": "...", "predicate": "VERB", "object": "..."}}]
Predicates must be one of: {", ".join(sorted(RELATION_LABELS))}

Entities:
{entity_list}

Text: {text[:1500]}"""

    try:
        raw = await call_gemini(prompt, temperature=0, json_mode=True)
        relations = json.loads(raw)
        return [
            relation
            for relation in relations
            if isinstance(relation, dict)
            and all(key in relation for key in ("subject", "predicate", "object"))
            and relation["predicate"] in RELATION_LABELS
            and len(relation["subject"]) <= 200
            and len(relation["object"]) <= 200
        ]
    except Exception as exc:
        logger.warning("Relation extraction error: %s", exc)
        return []
