import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import { useIngest } from "../../hooks/useIngest";
import { IngestEvent } from "../../types";
import { IngestProgress } from "./IngestProgress";

export function DropZone() {
  const [progress, setProgress] = useState<IngestEvent | null>(null);
  const mutation = useIngest();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) {
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error("File must be under 20MB");
        return;
      }

      setProgress(null);

      try {
        const result = await mutation.mutateAsync({
          file,
          onProgress: (event) => {
            setProgress(event);
          }
        });

        if (result.stage === "done") {
          toast.success(`Ingested ${result.filename} with ${result.chunks} chunks`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setTimeout(() => setProgress(null), 2000);
      }
    },
    [mutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
    disabled: mutation.isPending
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-accent-500 bg-accent-500/5"
            : "border-sand-300 bg-white/70 hover:border-sand-400"
        } ${mutation.isPending ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto max-w-lg space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-sand-500">Ingestion</div>
          <p className="text-2xl font-semibold text-sand-900">
            {isDragActive ? "Drop your file here" : "Drag a PDF or TXT file into the graph"}
          </p>
          <p className="text-sm leading-6 text-sand-600">
            KG-RAG extracts text, builds embeddings, identifies entities, and connects them into a
            queryable knowledge graph.
          </p>
          <p className="text-xs text-sand-500">PDF or TXT, max 20MB, one document at a time</p>
        </div>
      </div>

      {progress ? <IngestProgress event={progress} /> : null}
    </div>
  );
}
