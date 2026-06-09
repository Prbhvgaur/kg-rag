import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ChatMessage as ChatMessageType } from "../../types";
import { SourceBadges } from "./SourceBadges";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-3xl px-5 py-4 shadow-sm ${
          isUser ? "bg-accent-500 text-white" : "border border-sand-200 bg-white text-sand-900"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>

            {message.sources ? <SourceBadges sources={message.sources} /> : null}

            {message.graphFacts !== undefined ? (
              <p className="text-xs text-sand-500">
                {message.graphFacts} graph facts used
                {message.entities?.length ? ` · entities: ${message.entities.join(", ")}` : ""}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
