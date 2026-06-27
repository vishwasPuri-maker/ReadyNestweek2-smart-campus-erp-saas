"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BRANCHES, SECTIONS } from "@/lib/classes";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function SetClass({ role }: { role: "TEACHER" | "STUDENT" }) {
  const router = useRouter();
  const [branch, setBranch] = React.useState("");
  const [section, setSection] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!branch || !section) {
      setError("Pick a branch and a section.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, section }),
      });
      if (!res.ok) {
        setError("Couldn't save. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <p className="font-mono text-caption uppercase tracking-[0.2em] text-faint">
        One quick step
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink text-balance">
        Choose your class.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-body text-pretty">
        {role === "TEACHER"
          ? "Pick your branch and section — students in the same class will appear here, and your notices, attendance, and work go to them."
          : "Pick your branch and section — you'll see your class's notices, attendance, assignments, and timetable."}
      </p>

      <form onSubmit={save} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="branch">Branch</Label>
            <Select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} disabled={saving}>
              <option value="" disabled>
                Select…
              </option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="section">Section</Label>
            <Select id="section" value={section} onChange={(e) => setSection(e.target.value)} disabled={saving}>
              <option value="" disabled>
                Select…
              </option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error && <p className="text-[13px] font-medium text-vermillion-ink">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion disabled:pointer-events-none disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Continue
        </button>
      </form>
    </div>
  );
}
