import { GraphCanvas } from "../components/graph/GraphCanvas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useGraph } from "../hooks/useGraph";

export function Graph() {
  const { data, isLoading, error } = useGraph(200);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Visualization</div>
          <CardTitle>Knowledge graph</CardTitle>
          <CardDescription>
            Explore extracted entities and their relationships. Click a node to zoom the canvas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-[540px] w-full rounded-3xl" />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load graph data. Make sure the backend is running and connected to Neo4j.
            </div>
          ) : null}

          {data ? (
            <>
              <div className="flex flex-wrap gap-3 text-sm text-sand-600">
                <span>{data.nodes.length} entities</span>
                <span>{data.links.length} relationships</span>
              </div>
              <GraphCanvas data={data} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
