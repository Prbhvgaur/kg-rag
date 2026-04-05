import { useQuery } from "@tanstack/react-query";

import { fetchGraph } from "../api/graph";

export function useGraph(limit = 200) {
  return useQuery({
    queryKey: ["graph", limit],
    queryFn: () => fetchGraph(limit),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
}
