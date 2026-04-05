from functools import lru_cache

@lru_cache
def get_vector_store():
    from .vector.store import VectorStore

    return VectorStore()


@lru_cache
def get_graph_builder():
    from .graph.builder import GraphBuilder

    return GraphBuilder()


@lru_cache
def get_graph_searcher():
    from .graph.searcher import GraphSearcher

    return GraphSearcher()


@lru_cache
def get_query_engine():
    from .query.engine import QueryEngine

    return QueryEngine(get_vector_store(), get_graph_searcher())
