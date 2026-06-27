"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Student = { id: string; name: string };

export function AttendanceMarker({ students }: { students: Student[] }) {
  const router = useRouter();
  const [subject, setSubject] = React.useState("");
  const [present, setPresent] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(students.map((s) => [s.id, true]))
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const presentCount = students.filter((s) => present[s.id]).length;

  async function save() {
    setError(null);
    if (!subject.trim()) {
      setError("Enter a subject first.");
      return;
    }
    setSaving(true);
    const date = new Date().toISOString();
    try {
      const results = await Promise.all(
        students.map((s) =>
          fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: s.id,
              date,
              present: !!present[s.id],
              subject: subject.trim(),
            }),
          })
        )
      );
      if (results.some((r) => !r.ok)) {
        setError("Some records didn't save. Please try again.");
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (students.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface px-5 py-8 text-center text-[14px] text-faint">
        No students in your class yet — share your join link to bring them in.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (e.g. Physics)"
          className="h-10 max-w-xs"
          disabled={saving}
        />
        <span className="text-[13px] text-faint">
          {presentCount}/{students.length} present
        </span>
        <div className="ml-auto flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body">
              <Check className="size-4 text-vermillion-ink" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-vermillion px-4 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save attendance
          </button>
        </div>
      </div>

      {error && <p className="mb-3 text-[13px] font-medium text-vermillion-ink">{error}</p>}

      <div className="divide-y divide-line">
        {students.map((s) => {
          const isPresent = !!present[s.id];
          return (
            <div key={s.id} className="flex items-center justify-between py-2.5">
              <span className="text-[14.5px] text-ink">{s.name}</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPresent((p) => ({ ...p, [s.id]: true }))}
                  className={cn(
                    "h-8 rounded-md px-3 text-[13px] font-medium transition-colors",
                    isPresent ? "bg-ink text-white" : "border border-line text-body hover:bg-muted"
                  )}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => setPresent((p) => ({ ...p, [s.id]: false }))}
                  className={cn(
                    "h-8 rounded-md px-3 text-[13px] font-medium transition-colors",
                    !isPresent
                      ? "bg-vermillion text-white"
                      : "border border-line text-body hover:bg-muted"
                  )}
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
