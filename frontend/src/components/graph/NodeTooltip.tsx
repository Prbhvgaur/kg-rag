import { GraphNode } from "../../types";

export function getNodeTooltip(node: GraphNode) {
  return `${node.label}: ${node.name}`;
}
