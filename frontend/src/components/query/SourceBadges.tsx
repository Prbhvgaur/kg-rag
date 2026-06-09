import { Source } from "../../types";
import { Badge } from "../ui/badge";

interface SourceBadgesProps {
  sources: Source[];
}

export function SourceBadges({ sources }: SourceBadgesProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source) => (
        <Badge key={`${source.filename}-${source.text}`}>
          {source.filename} ({Math.round(source.score * 100)}%)
        </Badge>
      ))}
    </div>
  );
}
