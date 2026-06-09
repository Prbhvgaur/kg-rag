import { useEffect, useRef } from "react";

import { ChatInput } from "../components/query/ChatInput";
import { ChatMessage } from "../components/query/ChatMessage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useQueryMutation } from "../hooks/useQuery";
import { useAppStore } from "../store/useAppStore";

export function Query() {
  const messages = useAppStore((state) => state.messages);
  const clearMessages = useAppStore((state) => state.clearMessages);
  const mutation = useQueryMutation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr]">
      <Card className="min-h-[70vh]">
        <CardHeader className="border-b border-sand-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Grounded chat</div>
              <CardTitle>Ask your documents</CardTitle>
              <CardDescription>
                Answers are synthesized from retrieved chunks and graph facts only.
              </CardDescription>
            </div>
            {messages.length > 0 ? (
              <button
                onClick={clearMessages}
                className="text-xs font-medium text-sand-500 transition hover:text-sand-900"
                type="button"
              >
                Clear chat
              </button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-sand-50 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[340px] items-center justify-center text-center">
                <div className="max-w-md space-y-2">
                  <p className="text-lg font-medium text-sand-800">
                    Upload documents first, then start asking grounded questions.
                  </p>
                  <p className="text-sm text-sand-500">
                    KG-RAG combines vector retrieval with graph traversal for multi-hop reasoning.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}

            {mutation.isPending ? (
              <div className="space-y-2 rounded-3xl border border-sand-200 bg-white p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <ChatInput
            onSend={(question) => mutation.mutate({ question })}
            disabled={mutation.isPending}
          />
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Retrieval controls</div>
          <CardTitle>How answers are grounded</CardTitle>
          <CardDescription>
            The backend embeds the question, retrieves top semantic chunks, finds graph entities,
            traverses connected facts, then asks Gemini to answer from that combined context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-sand-600">
          <div>Vector search ranks semantically similar chunks in pgvector.</div>
          <div>Neo4j full-text search identifies candidate entities from the question.</div>
          <div>Graph traversal supplies multi-hop relationships for synthesis.</div>
        </CardContent>
      </Card>
    </div>
  );
}
