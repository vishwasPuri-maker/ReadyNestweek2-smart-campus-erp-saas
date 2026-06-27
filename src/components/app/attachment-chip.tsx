import { Download, Eye, FileImage, FileText } from "lucide-react";
import { isImage, prettySize } from "@/lib/files";

type Att = { id: string; name: string; type: string; size: number };

function isAtt(v: unknown): v is Att {
  return (
    !!v &&
    typeof v === "object" &&
    "id" in v &&
    "name" in v &&
    typeof (v as Record<string, unknown>).id === "string"
  );
}

/** Renders a file attachment with view + download actions. Pass the raw Json value;
 *  it no-ops if there's no valid attachment. */
export function AttachmentChip({ attachment }: { attachment: unknown }) {
  if (!isAtt(attachment)) return null;
  const a = attachment;
  const Icon = isImage(a.type) ? FileImage : FileText;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface text-vermillion">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-ink">{a.name}</p>
        <p className="text-[11px] text-faint">{prettySize(a.size)}</p>
      </div>
      <a
        href={`/api/files/${a.id}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-muted"
      >
        <Eye className="size-3.5" />
        View
      </a>
      <a
        href={`/api/files/${a.id}?download=1`}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-muted"
      >
        <Download className="size-3.5" />
        Download
      </a>
    </div>
  );
}
