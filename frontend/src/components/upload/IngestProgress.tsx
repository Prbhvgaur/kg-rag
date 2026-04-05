import { IngestEvent } from "../../types";
import { Progress } from "../ui/progress";

interface IngestProgressProps {
  event: IngestEvent;
}

export function IngestProgress({ event }: IngestProgressProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-sand-200 bg-sand-50 p-4">
      <div className="flex items-center justify-between text-sm text-sand-700">
        <span>{event.message}</span>
        <span className="font-medium">{event.progress}%</span>
      </div>
      <Progress value={event.progress} />
    </div>
  );
}
