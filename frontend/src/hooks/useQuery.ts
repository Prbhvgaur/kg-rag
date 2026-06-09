import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

import { sendQuery } from "../api/query";
import { useAppStore } from "../store/useAppStore";
import { ChatMessage } from "../types";

export function useQueryMutation() {
  const addMessage = useAppStore((state) => state.addMessage);

  return useMutation({
    mutationFn: ({ question }: { question: string }) => sendQuery(question),
    onMutate: ({ question }) => {
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: question,
        timestamp: new Date().toISOString()
      };
      addMessage(userMessage);
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        entities: data.entities_matched,
        graphFacts: data.graph_facts_used,
        timestamp: new Date().toISOString()
      };
      addMessage(assistantMessage);
    }
  });
}
