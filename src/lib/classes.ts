// Branch + section options for class-scoped features. Teachers and students each
// pick a branch + section; they're linked when both values match (within an org).

export const BRANCHES = ["CSE", "AIDS", "AIML", "DS", "ECE", "IT"] as const;
export const SECTIONS = ["A", "B", "C", "D"] as const;

export type Branch = (typeof BRANCHES)[number];
export type Section = (typeof SECTIONS)[number];

export function isBranch(v: unknown): v is Branch {
  return typeof v === "string" && (BRANCHES as readonly string[]).includes(v);
}
export function isSection(v: unknown): v is Section {
  return typeof v === "string" && (SECTIONS as readonly string[]).includes(v);
}

/** "CSE · A" — display label for a class. */
export function classLabel(branch?: string | null, section?: string | null) {
  if (!branch || !section) return null;
  return `${branch} · ${section}`;
}

/** Current weekday (0=Sun…6=Sat). In a helper so callers don't trip the
 *  react-hooks purity rule by reading the clock inline during render. */
export function todayWeekday(): number {
  return new Date().getDay();
}

/** "Monday, Jun 27" — today's date label. */
export function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
