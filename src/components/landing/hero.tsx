import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { HeroMockup } from "./hero-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* faint structural grid backdrop */}
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_30%,transparent_75%)]"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Copy */}
        <div>
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1.5 pl-1.5 pr-3.5 shadow-soft">
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
              <ShieldCheck className="size-3" />
              Multi-tenant
            </span>
            <span className="text-[12.5px] font-medium text-body">
              One app. Every college sealed off.
            </span>
          </div>

          <h1
            className="animate-rise mt-6 font-display text-[clamp(2.6rem,7vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-ink text-balance"
            style={{ ["--rise-delay" as string]: "80ms" }}
          >
            Run your whole campus from one workspace.
          </h1>

          <p
            className="animate-rise mt-6 max-w-xl text-body-lg text-body text-pretty"
            style={{ ["--rise-delay" as string]: "160ms" }}
          >
            Notices, timetable, attendance, assignments, and notes — for admins,
            teachers, and students alike. Every college&apos;s data stays fully
            isolated, enforced on the server for every single request.
          </p>

          <div
            className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ ["--rise-delay" as string]: "240ms" }}
          >
            <Link
              href="/register"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-transparent px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-ink/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/30"
            >
              Register your college
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#isolation"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-transparent px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-ink/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
            >
              See how it works
            </a>
          </div>

          <dl
            className="animate-rise mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6"
            style={{ ["--rise-delay" as string]: "320ms" }}
          >
            {[
              { v: "3 roles", k: "Admin · Teacher · Student" },
              { v: "< 1s", k: "Every API response" },
              { v: "0", k: "Cross-tenant data leaks" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-mono text-[22px] font-semibold tracking-tight text-ink">
                  {s.v}
                </dt>
                <dd className="mt-0.5 text-[12.5px] text-faint">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Product shot */}
        <div
          className="animate-rise lg:pl-2"
          style={{ ["--rise-delay" as string]: "200ms" }}
        >
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
