import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center sm:px-12 sm:py-24">
        <div
          aria-hidden
          className="dot-atlas pointer-events-none absolute inset-0 text-white/[0.06] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_40%,#000,transparent_75%)]"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white text-balance">
            Bring your whole college online today.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-body-lg text-white/65 text-pretty">
            Register your institution, invite your people, and have teachers and
            students working within minutes — on data that&apos;s yours alone.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-vermillion px-7 text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
            >
              Register your college
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-line-dark bg-white/5 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
