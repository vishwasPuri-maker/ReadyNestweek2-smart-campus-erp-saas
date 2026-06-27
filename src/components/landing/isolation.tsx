import { Lock, ShieldX } from "lucide-react";
import { Reveal } from "./reveal";

function TenantCard({
  name,
  accent = false,
  rows,
}: {
  name: string;
  accent?: boolean;
  rows: string[];
}) {
  return (
    <div
      className={
        "min-w-0 flex-1 rounded-xl border bg-ink-2 p-4 " +
        (accent ? "border-vermillion/60" : "border-line-dark")
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-white">{name}</span>
        <span
          className={
            "size-2 rounded-full " + (accent ? "bg-vermillion" : "bg-white/25")
          }
        />
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r}
            className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2.5 py-1.5"
          >
            <span className="size-1 rounded-full bg-white/30" />
            <span className="font-mono text-[11px] text-white/55">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Isolation() {
  return (
    <section id="isolation" className="relative overflow-hidden bg-ink text-white">
      {/* dot atlas wash */}
      <div
        aria-hidden
        className="dot-atlas pointer-events-none absolute inset-0 text-white/[0.07] [mask-image:radial-gradient(ellipse_80%_80%_at_70%_30%,#000_10%,transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-vermillion">
              Tenant isolation
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance">
              Every college, sealed off.
            </h2>
            <p className="mt-5 max-w-md text-body-lg leading-relaxed text-white/65 text-pretty">
              One app serves thousands of colleges — but no college can ever see,
              touch, or even detect another&apos;s data. The boundary isn&apos;t a
              hidden button or a filtered view. It&apos;s enforced on the server,
              in the database query itself, for every request.
            </p>

            <div className="mt-7 rounded-lg border border-line-dark bg-ink-2 p-4">
              <p className="font-mono text-[12px] leading-relaxed text-white/55">
                <span className="text-white/35">{"// every query, automatically"}</span>
                <br />
                {"where: { "}
                <span className="text-vermillion">organizationId</span>
                {" }"}{" "}
                <span className="text-white/35">← from your verified token,</span>
                <br />
                <span className="text-white/35">
                  &nbsp;&nbsp;never from the request body or URL
                </span>
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-line-dark bg-ink-2/40 p-4 sm:p-6">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:gap-4">
                <TenantCard
                  name="Northgate College"
                  rows={["1,840 students", "Attendance · Q3", "112 notices"]}
                />
                {/* barrier */}
                <div className="flex flex-row items-center justify-center gap-2 px-1 sm:flex-col">
                  <span className="h-px w-full bg-gradient-to-r from-transparent via-vermillion/70 to-transparent sm:h-full sm:w-px sm:bg-gradient-to-b" />
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-vermillion/50 bg-vermillion/10">
                    <Lock className="size-4 text-vermillion" />
                  </span>
                  <span className="h-px w-full bg-gradient-to-r from-transparent via-vermillion/70 to-transparent sm:h-full sm:w-px sm:bg-gradient-to-b" />
                </div>
                <TenantCard
                  name="Demo College"
                  accent
                  rows={["1,204 students", "Attendance · Q3", "87 notices"]}
                />
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-lg border border-line-dark bg-black/30 px-4 py-3">
                <ShieldX className="mt-0.5 size-4 shrink-0 text-vermillion" />
                <p className="text-[13px] leading-relaxed text-white/70">
                  Northgate&apos;s token requests a Demo College record by ID →{" "}
                  <span className="font-mono font-semibold text-white">
                    404 Not Found
                  </span>
                  . Not 403, not an empty list — it simply does not exist for them.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
