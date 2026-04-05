import { GraphData } from "../types";
import { apiClient } from "./client";

export async function fetchGraph(limit = 200): Promise<GraphData> {
  const { data } = await apiClient.get<GraphData>("/graph", {
    params: { limit }
  });
  return data;
}
