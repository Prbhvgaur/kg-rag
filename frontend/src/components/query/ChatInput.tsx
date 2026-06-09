import { KeyboardEvent, useState } from "react";

import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-3 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, 1000))}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Ask a grounded question about the ingested documents..."
          disabled={disabled}
          className="min-h-[88px] border-0 bg-sand-50"
        />
        <Button onClick={handleSend} disabled={disabled || !value.trim()} className="sm:self-end">
          {disabled ? "Thinking..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
