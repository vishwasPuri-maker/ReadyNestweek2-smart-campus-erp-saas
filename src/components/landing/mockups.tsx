import { GraduationCap, StickyNote, Users } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Shared coded product mockups used by the role sections. The animated
 * hero dashboard lives in ./hero-mockup (client component).
 * ------------------------------------------------------------------ */

/** Compact attendance ring — used in the student role panel. */
export function AttendanceRing({ pct = 94 }: { pct?: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg viewBox="0 0 88 88" className="size-24">
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="8"
      />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="var(--color-vermillion)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 44 44)"
      />
      <text
        x="44"
        y="44"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink font-mono"
        fontSize="18"
        fontWeight="600"
      >
        {pct}%
      </text>
    </svg>
  );
}

/** Small framed panel used inside role sections. */
export function RolePanel({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-[13px] font-semibold tracking-tight">{title}</span>
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-faint">
          {badge}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export const roleIcons = {
  admin: GraduationCap,
  teacher: Users,
  student: StickyNote,
};
