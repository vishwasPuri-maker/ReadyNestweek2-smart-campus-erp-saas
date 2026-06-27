import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

type Cap = "full" | "some" | "view" | "own" | "none";

const legend: Record<Cap, { label: string; cls: string }> = {
  full: { label: "Manage", cls: "bg-vermillion text-white" },
  some: { label: "Create", cls: "bg-ink text-white" },
  view: { label: "View", cls: "border border-line bg-surface text-body" },
  own: { label: "Own", cls: "bg-muted text-ink" },
  none: { label: "—", cls: "text-faint" },
};

const rows: { feature: string; note: string; caps: [Cap, Cap, Cap] }[] = [
  { feature: "Notices", note: "Announcements across the college", caps: ["full", "some", "view"] },
  { feature: "Timetable", note: "Weekly schedule by class & room", caps: ["full", "some", "view"] },
  { feature: "Attendance", note: "Mark, track, and report", caps: ["full", "some", "view"] },
  { feature: "Assignments", note: "Teacher → student work", caps: ["view", "full", "own"] },
  { feature: "Tasks & notes", note: "Personal to-dos and private notes", caps: ["own", "own", "own"] },
  { feature: "Profile", note: "Account & personal details", caps: ["own", "own", "own"] },
];

const roleHeads = ["Admin", "Teacher", "Student"];

function Cell({ cap }: { cap: Cap }) {
  const { label, cls } = legend[cap];
  if (cap === "none") return <span className="text-[13px] text-faint">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:text-[11.5px]",
        cls
      )}
    >
      {label}
    </span>
  );
}

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="border-y border-line bg-surface"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-balance">
              Everything a campus actually runs on.
            </h2>
            <p className="mt-4 max-w-md text-body-lg text-body text-pretty">
              Six core surfaces, one permission model. Who can do what isn&apos;t a
              setting you configure — it&apos;s enforced on the server for every
              role, on every request.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(["full", "some", "view", "own"] as Cap[]).map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <Cell cap={c} />
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="overflow-hidden rounded-xl border border-line">
            {/* header */}
            <div className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] gap-2 border-b border-line bg-paper/60 px-4 py-3 sm:px-5">
              <span className="font-mono text-[11px] uppercase tracking-wide text-faint">
                Feature
              </span>
              {roleHeads.map((r) => (
                <span
                  key={r}
                  className="text-right font-mono text-[11px] uppercase tracking-wide text-faint sm:text-center"
                >
                  {r}
                </span>
              ))}
            </div>
            {rows.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.4fr_repeat(3,0.8fr)] items-center gap-2 border-b border-line px-4 py-3.5 last:border-0 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{row.feature}</p>
                  <p className="mt-0.5 hidden truncate text-[12px] text-faint sm:block">
                    {row.note}
                  </p>
                </div>
                {row.caps.map((c, i) => (
                  <div key={i} className="flex justify-end sm:justify-center">
                    <Cell cap={c} />
                  </div>
                ))}
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
