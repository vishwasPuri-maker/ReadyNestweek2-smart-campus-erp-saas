"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilePicker } from "@/components/app/file-picker";
import { uploadFile } from "@/lib/files";

function SubmitButton({ saving, done, label }: { saving: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press disabled:pointer-events-none disabled:opacity-60"
      >
        {saving && <Loader2 className="size-4 animate-spin" />}
        {label}
      </button>
      {done && (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body">
          <Check className="size-4 text-vermillion-ink" /> Posted
        </span>
      )}
    </div>
  );
}

export function NoticeComposer() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !body.trim()) {
      setError("Add a title and a message.");
      return;
    }
    setSaving(true);
    try {
      const attachment = file ? await uploadFile(file) : undefined;
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), attachment }),
      });
      if (!res.ok) {
        setError("Couldn't post. Please try again.");
        return;
      }
      setTitle("");
      setBody("");
      setFile(null);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" disabled={saving} />
      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your notice to the class…" disabled={saving} />
      <FilePicker file={file} onFile={setFile} disabled={saving} />
      {error && <p className="text-[13px] font-medium text-vermillion-ink">{error}</p>}
      <SubmitButton saving={saving} done={done} label="Post to my class" />
    </form>
  );
}

export function AssignmentComposer() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    setSaving(true);
    try {
      const attachment = file ? await uploadFile(file) : undefined;
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          assignToClass: true,
          attachment,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.message ?? "Couldn't assign. Please try again.");
        return;
      }
      setTitle("");
      setDescription("");
      setDueDate("");
      setFile(null);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" disabled={saving} />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details (optional)…" disabled={saving} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] text-faint">Due</span>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-10 max-w-[180px]"
          disabled={saving}
        />
      </div>
      <FilePicker file={file} onFile={setFile} disabled={saving} />
      {error && <p className="text-[13px] font-medium text-vermillion-ink">{error}</p>}
      <SubmitButton saving={saving} done={done} label="Assign to class" />
    </form>
  );
}
