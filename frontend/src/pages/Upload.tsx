import { DropZone } from "../components/upload/DropZone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/useAppStore";

export function Upload() {
  const documents = useAppStore((state) => state.documents);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Pipeline</div>
            <CardTitle>Build your retrieval graph from raw documents</CardTitle>
            <CardDescription>
              Upload PDFs or TXT files and KG-RAG will extract text, embed chunks, identify
              entities, and connect relationships for grounded multi-hop retrieval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropZone />
          </CardContent>
        </Card>

        <Card className="bg-sand-900 text-sand-50">
          <CardHeader>
            <div className="text-xs uppercase tracking-[0.35em] text-sand-400">Why KG-RAG</div>
            <CardTitle className="text-sand-50">Structured retrieval beats flat context stuffing</CardTitle>
            <CardDescription className="text-sand-300">
              Vector search pulls relevant passages, while the graph supplies explicit entity
              relationships the model can reason over before answering.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-sand-200">
            <div>1. Extract and chunk long-form text safely.</div>
            <div>2. Store embeddings in pgvector for semantic search.</div>
            <div>3. Materialize entities and relationships in Neo4j.</div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ingested documents</CardTitle>
          <CardDescription>Recently processed files ready for retrieval and graph traversal.</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-sand-500">No documents yet. Upload one to get started.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.doc_id}
                  className="flex items-center justify-between rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-sand-900">{doc.filename}</div>
                    <div className="text-xs text-sand-500">{doc.chunks} chunks indexed</div>
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent-600">
                    Ready
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
