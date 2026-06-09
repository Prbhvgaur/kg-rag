import { useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";

import { GraphData, GraphNode } from "../../types";
import { getNodeTooltip } from "./NodeTooltip";

const LABEL_COLORS: Record<string, string> = {
  PERSON: "#1f6feb",
  ORGANIZATION: "#0f766e",
  DRUG: "#c2410c",
  DISEASE: "#be123c",
  TECHNOLOGY: "#7c3aed",
  LOCATION: "#4d7c0f",
  CONCEPT: "#a16207",
  DEFAULT: "#6b7280"
};

interface GraphCanvasProps {
  data: GraphData;
}

export function GraphCanvas({ data }: GraphCanvasProps) {
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (!graphRef.current || data.nodes.length === 0) {
      return;
    }
    const timeout = window.setTimeout(() => {
      graphRef.current?.zoomToFit?.(400, 48);
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [data]);

  return (
    <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-panel">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeColor={(node: any) => LABEL_COLORS[(node as GraphNode).label] || LABEL_COLORS.DEFAULT}
        nodeLabel={(node: any) => getNodeTooltip(node as GraphNode)}
        nodeRelSize={6}
        linkLabel={(link: any) => (link as { relation: string }).relation}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={() => "#b7ad9a"}
        backgroundColor="#f9f8f5"
        height={540}
        onNodeClick={(node: any) => {
          graphRef.current?.centerAt(node.x, node.y, 500);
          graphRef.current?.zoom(3, 500);
        }}
      />
    </div>
  );
}
