"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePicker } from "@/components/app/file-picker";
import { AttachmentChip } from "@/components/app/attachment-chip";
import { uploadFile } from "@/lib/files";

type Note = { id: string; title: string; content: string; attachment: unknown };

export function NotesPanel({ notes }: { notes: Note[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Give your note a title.");
      return;
    }
    if (!content.trim() && !file) {
      setError("Write something or attach a file.");
      return;
    }
    setSaving(true);
    try {
      const attachment = file ? await uploadFile(file) : undefined;
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() || undefined, attachment }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setFile(null);
        setOpen(false);
        router.refresh();
      } else {
        setError("Couldn't save. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted"
        >
          {open ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {open ? "Cancel" : "New note"}
        </button>
      </div>

      {open && (
        <form onSubmit={add} className="mb-4 space-y-3 rounded-2xl border border-line bg-surface p-5">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" disabled={saving} />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note… (or just attach a file below)"
            disabled={saving}
          />
          <FilePicker file={file} onFile={setFile} disabled={saving} />
          {error && <p className="text-[13px] font-medium text-vermillion-ink">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save note
          </button>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="border-t border-line py-10 text-[14px] text-faint">No notes yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => (
            <li key={n.id} className="group relative rounded-2xl border border-line bg-surface p-4">
              <button
                type="button"
                onClick={() => del(n.id)}
                disabled={busyId === n.id}
                aria-label="Delete note"
                className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-faint opacity-0 transition hover:bg-muted hover:text-vermillion-ink group-hover:opacity-100"
              >
                {busyId === n.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </button>
              <p className="pr-8 text-[14.5px] font-semibold text-ink">{n.title}</p>
              {n.content && (
                <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-body">{n.content}</p>
              )}
              <AttachmentChip attachment={n.attachment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
