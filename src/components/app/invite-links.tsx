"use client";

import * as React from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Role = "TEACHER" | "STUDENT";
type Invite = {
  code: string;
  expiresAt: string | null;
  maxUses: number | null;
  uses: number;
};

function expiryLabel(expiresAt: string | null) {
  if (!expiresAt) return { text: "No expiry", danger: false };
  const d = new Date(expiresAt);
  if (d.getTime() < Date.now()) return { text: "Expired", danger: true };
  return {
    text: `Expires ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    danger: false,
  };
}

function LinkRow({
  role,
  label,
  invite: initial,
  origin,
}: {
  role: Role;
  label: string;
  invite: Invite;
  origin: string;
}) {
  const [invite, setInvite] = React.useState<Invite>(initial);
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [days, setDays] = React.useState("30");
  const [maxUses, setMaxUses] = React.useState("");

  const url = `${origin}/join/${invite.code}`;
  const expiry = expiryLabel(invite.expiresAt);
  const limitReached = invite.maxUses != null && invite.uses >= invite.maxUses;
  const usesText =
    invite.maxUses != null ? `${invite.uses}/${invite.maxUses} joined` : `${invite.uses} joined`;
  const dead = expiry.danger || limitReached;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function regenerate() {
    setBusy(true);
    try {
      const res = await fetch("/api/organizations/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          expiresInDays: days === "never" ? null : Number(days),
          maxUses: maxUses.trim() ? Number(maxUses) : null,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setInvite({ code: d.code, expiresAt: d.expiresAt, maxUses: d.maxUses, uses: 0 });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">{label} link</span>
        <span className={cn("text-[12px]", dead ? "font-medium text-vermillion-ink" : "text-faint")}>
          {expiry.text} · {limitReached ? "Limit reached" : usesText}
        </span>
      </div>

      <div className="flex items-stretch gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-10 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 font-mono text-[12.5px] outline-none focus-visible:border-vermillion focus-visible:ring-[3px] focus-visible:ring-vermillion/20",
            dead ? "text-faint line-through" : "text-body"
          )}
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-graphite"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Regenerate with a fresh expiry + optional usage cap */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <span className="text-[12px] text-faint">New link:</span>
        <Select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="h-9 w-[112px] text-[13px]"
          aria-label="Expiry"
        >
          <option value="7">7 days</option>
          <option value="30">30 days</option>
          <option value="90">90 days</option>
          <option value="never">No expiry</option>
        </Select>
        <Input
          type="number"
          min={1}
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="Max uses"
          className="h-9 w-[120px] text-[13px]"
          aria-label="Max uses"
        />
        <button
          type="button"
          onClick={regenerate}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={cn("size-3.5", busy && "animate-spin")} />
          Regenerate
        </button>
      </div>
    </div>
  );
}

export function InviteLinks({
  teacher,
  student,
}: {
  teacher: Invite;
  student: Invite;
}) {
  const [origin, setOrigin] = React.useState("");
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setOrigin(window.location.origin));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LinkRow role="TEACHER" label="Teacher" invite={teacher} origin={origin} />
      <LinkRow role="STUDENT" label="Student" invite={student} origin={origin} />
    </div>
  );
}
