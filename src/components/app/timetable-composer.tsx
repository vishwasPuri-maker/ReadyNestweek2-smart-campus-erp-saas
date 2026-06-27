"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const DAYS = [
  { v: 1, label: "Monday" },
  { v: 2, label: "Tuesday" },
  { v: 3, label: "Wednesday" },
  { v: 4, label: "Thursday" },
  { v: 5, label: "Friday" },
  { v: 6, label: "Saturday" },
  { v: 0, label: "Sunday" },
];

export function TimetableComposer({
  branch,
  section,
}: {
  branch: string;
  section: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [day, setDay] = React.useState("1");
  const [start, setStart] = React.useState("09:00");
  const [end, setEnd] = React.useState("10:00");
  const [subject, setSubject] = React.useState("");
  const [room, setRoom] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!subject.trim()) {
      setError("Add a subject.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: Number(day),
          startTime: start,
          endTime: end,
          subject: subject.trim(),
          room: room.trim() || undefined,
          branch,
          section,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.message ?? "Couldn't add. Please try again.");
        return;
      }
      setSubject("");
      setRoom("");
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
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
          {open ? "Cancel" : "Add class"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-4 space-y-3 rounded-2xl border border-line bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={day} onChange={(e) => setDay(e.target.value)} disabled={saving} aria-label="Day">
              {DAYS.map((d) => (
                <option key={d.v} value={d.v}>
                  {d.label}
                </option>
              ))}
            </Select>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" disabled={saving} />
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} disabled={saving} aria-label="Start time" />
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} disabled={saving} aria-label="End time" />
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room (optional)" disabled={saving} className="sm:col-span-2" />
          </div>
          {error && <p className="text-[13px] font-medium text-vermillion-ink">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Add to timetable
            </button>
            {done && (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body">
                <Check className="size-4 text-vermillion-ink" /> Added
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
