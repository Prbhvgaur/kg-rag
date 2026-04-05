import { QueryResponse } from "../types";
import { apiClient } from "./client";

export async function sendQuery(
  question: string,
  maxHops = 2,
  topK = 5
): Promise<QueryResponse> {
  const { data } = await apiClient.post<QueryResponse>("/query", {
    question,
    max_hops: maxHops,
    top_k: topK
  });
  return data;
}
