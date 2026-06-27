"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { AddPersonForm } from "@/components/app/add-person-form";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Person = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isActive: boolean;
  verified: boolean;
  createdAt: string;
};

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-vermillion/10 text-vermillion-ink",
  TEACHER: "bg-ink text-white",
  STUDENT: "bg-muted text-ink",
};

const COLS = "grid-cols-[2fr_136px_116px_110px_118px]";
const titleCase = (r: string) => r.charAt(0) + r.slice(1).toLowerCase();
const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export function PeopleClient({
  users,
  selfId,
}: {
  users: Person[];
  selfId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    setBusyId(id);
    try {
      await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(p: Person) {
    setBusyId(p.id);
    try {
      if (p.isActive) {
        await fetch(`/api/users/${p.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/users/${p.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="People"
        subtitle={`${users.length} ${users.length === 1 ? "person" : "people"} in your college`}
        action={
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
          >
            <Plus
              className={cn(
                "size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                open && "rotate-[135deg]"
              )}
            />
            {open ? "Close" : "Add person"}
          </button>
        }
      />

      {/* Smoothly animated add form */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          open ? "mb-10 grid-rows-[1fr] opacity-100" : "mb-0 grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-2xl border border-line bg-paper p-6">
            <AddPersonForm onDone={() => setOpen(false)} />
          </div>
        </div>
      </div>

      {/* Editorial list — hairline rows, hover-reactive */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className={cn("grid gap-4 border-b border-line pb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-faint", COLS)}>
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span className="text-right">Actions</span>
          </div>

          {users.length === 0 ? (
            <p className="py-14 text-center text-[15px] text-faint">
              No people yet — add your first teacher or student.
            </p>
          ) : (
            users.map((p) => {
              const locked = p.role === "ADMIN" || p.id === selfId;
              return (
                <div
                  key={p.id}
                  className={cn("group grid items-center gap-4 border-b border-line py-4 transition-colors hover:bg-paper", COLS)}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink ring-1 ring-line transition-shadow group-hover:ring-vermillion/40">
                      {initials(p.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-medium text-ink">{p.name}</p>
                      <p className="truncate text-[12.5px] text-faint">{p.email}</p>
                    </div>
                  </div>

                  <div>
                    {locked ? (
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", ROLE_BADGE[p.role])}>
                        {titleCase(p.role)}
                      </span>
                    ) : (
                      <Select
                        value={p.role}
                        onChange={(e) => changeRole(p.id, e.target.value)}
                        disabled={busyId === p.id}
                        className="h-8 text-[13px]"
                      >
                        <option value="TEACHER">Teacher</option>
                        <option value="STUDENT">Student</option>
                      </Select>
                    )}
                  </div>

                  <div>
                    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", p.isActive ? "text-body" : "text-faint")}>
                      <span className={cn("size-1.5 rounded-full", p.isActive ? "bg-ink" : "bg-line")} />
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="text-[13px] text-body">
                    {new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  <div className="text-right">
                    {locked ? (
                      <span className="text-[13px] text-faint">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        disabled={busyId === p.id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted disabled:opacity-60"
                      >
                        {busyId === p.id && <Loader2 className="size-3.5 animate-spin" />}
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
