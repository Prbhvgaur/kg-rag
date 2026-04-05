import { IngestEvent } from "../types";
import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function* ingestDocument(
  file: File,
  onProgress?: (event: IngestEvent) => void
): AsyncGenerator<IngestEvent> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/api/v1/ingest`, {
    method: "POST",
    body: formData,
    headers: session?.access_token
      ? {
          Authorization: `Bearer ${session.access_token}`
        }
      : undefined
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Ingestion failed");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming is not supported in this browser");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() || "";

    for (const frame of frames) {
      const line = frame.split("\n").find((entry) => entry.startsWith("data: "));
      if (!line) {
        continue;
      }
      let event: IngestEvent;
      try {
        event = JSON.parse(line.slice(6)) as IngestEvent;
      } catch {
        // Ignore malformed frames.
        continue;
      }

      onProgress?.(event);
      if (event.stage === "error") {
        throw new Error(event.message || "Ingestion failed");
      }
      yield event;
    }
  }
}
