"use client";

import * as React from "react";
import { Paperclip, X } from "lucide-react";
import { ACCEPT_ATTR, MAX_FILE_BYTES, isAllowedType, prettySize } from "@/lib/files";

export function FilePicker({
  file,
  onFile,
  disabled,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [err, setErr] = React.useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      onFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setErr("File too large — max 10 MB");
      e.target.value = "";
      return;
    }
    if (!isAllowedType(f.type)) {
      setErr("Use an image, PDF, or Word document");
      e.target.value = "";
      return;
    }
    setErr(null);
    onFile(f);
  }

  function clear() {
    onFile(null);
    if (ref.current) ref.current.value = "";
    setErr(null);
  }

  return (
    <div>
      <input ref={ref} type="file" accept={ACCEPT_ATTR} className="hidden" onChange={onChange} disabled={disabled} />
      {file ? (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
          <Paperclip className="size-3.5 shrink-0 text-faint" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{file.name}</span>
          <span className="shrink-0 text-[11.5px] text-faint">{prettySize(file.size)}</span>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            aria-label="Remove file"
            className="shrink-0 text-faint transition-colors hover:text-vermillion-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={disabled}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted disabled:opacity-60"
        >
          <Paperclip className="size-3.5" />
          Attach file
        </button>
      )}
      {err && <p className="mt-1.5 text-[12px] font-medium text-vermillion-ink">{err}</p>}
    </div>
  );
}
