"""Knowledge graph services."""

import ssl

import certifi
from neo4j import AsyncGraphDatabase

from ..config import get_settings


def _normalize_neo4j_uri(uri: str) -> str:
    if uri.startswith("neo4j+s://"):
        return uri.replace("neo4j+s://", "neo4j://", 1)
    if uri.startswith("bolt+s://"):
        return uri.replace("bolt+s://", "bolt://", 1)
    return uri


def create_async_driver(max_connection_pool_size: int | None = None):
    settings = get_settings()
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    kwargs = {
        "auth": (settings.neo4j_user, settings.neo4j_password),
        "ssl_context": ssl_context,
    }
    if max_connection_pool_size is not None:
        kwargs["max_connection_pool_size"] = max_connection_pool_size
    return AsyncGraphDatabase.driver(_normalize_neo4j_uri(settings.neo4j_uri), **kwargs)
