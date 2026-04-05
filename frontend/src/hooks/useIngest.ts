import { useMutation } from "@tanstack/react-query";

import { ingestDocument } from "../api/ingest";
import { useAppStore } from "../store/useAppStore";
import { IngestEvent } from "../types";

interface IngestArgs {
  file: File;
  onProgress?: (event: IngestEvent) => void;
}

export function useIngest() {
  const addDocument = useAppStore((state) => state.addDocument);

  return useMutation({
    mutationFn: async ({ file, onProgress }: IngestArgs) => {
      let finalEvent: IngestEvent | null = null;
      for await (const event of ingestDocument(file, onProgress)) {
        finalEvent = event;
      }
      if (!finalEvent) {
        throw new Error("No ingestion events were returned");
      }
      return finalEvent;
    },
    onSuccess: (event) => {
      if (event.stage === "done" && event.doc_id && event.filename && event.chunks !== undefined) {
        addDocument({
          doc_id: event.doc_id,
          filename: event.filename,
          chunks: event.chunks,
          ingestedAt: new Date().toISOString()
        });
      }
    }
  });
}
