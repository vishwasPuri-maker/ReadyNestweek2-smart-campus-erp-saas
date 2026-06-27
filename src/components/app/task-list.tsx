"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { AttachmentChip } from "@/components/app/attachment-chip";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  assigned: boolean;
  attachment: unknown;
};

export function TaskList({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = React.useState(initial);
  const [busy, setBusy] = React.useState<string | null>(null);

  async function toggle(t: Task) {
    const next = !t.completed;
    setBusy(t.id);
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, completed: next } : x)));
    try {
      const res = await fetch(`/api/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) {
        setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, completed: !next } : x)));
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="space-y-3">
      {tasks.map((t) => (
        <li
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-soft transition-shadow",
            !t.completed && "hover:shadow-float"
          )}
        >
          <button
            type="button"
            onClick={() => toggle(t)}
            disabled={busy === t.id}
            aria-pressed={t.completed}
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
              t.completed
                ? "border-vermillion bg-vermillion text-white"
                : "border-line text-transparent hover:border-ink"
            )}
          >
            {busy === t.id ? (
              <Loader2 className="size-3 animate-spin text-ink" />
            ) : (
              <Check className="size-3.5" strokeWidth={3} />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className={cn("text-[14.5px] font-semibold", t.completed ? "text-faint line-through" : "text-ink")}>
                {t.title}
              </p>
              {t.dueDate && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px]",
                    t.completed ? "bg-muted text-faint" : "bg-vermillion/10 text-vermillion-ink"
                  )}
                >
                  Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            {t.description && (
              <p className="mt-1 text-[13px] leading-relaxed text-body">{t.description}</p>
            )}
            <AttachmentChip attachment={t.attachment} />
          </div>
        </li>
      ))}
    </ul>
  );
}
