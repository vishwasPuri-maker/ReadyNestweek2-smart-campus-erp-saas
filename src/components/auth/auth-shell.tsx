import * as React from "react";
import Link from "next/link";

/**
 * Split auth layout: form on the left (paper), a dark monochrome brand panel on the
 * right (hidden on mobile). Presentational — pages drop their form in as children.
 */
export function AuthShell({
  children,
  panelTitle,
  panelText,
}: {
  children: React.ReactNode;
  panelTitle: string;
  panelText: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form column */}
      <div className="flex flex-col px-5 py-7 sm:px-10">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermillion"
          aria-label="Smart Campus home"
        >
          <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
            S
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            Smart Campus
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink text-white lg:block">
        <div
          aria-hidden
          className="dot-atlas pointer-events-none absolute inset-0 text-white/[0.06] [mask-image:radial-gradient(ellipse_80%_70%_at_70%_30%,#000_10%,transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/3 size-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--color-vermillion) 14%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="mb-auto inline-flex items-center gap-2 rounded-full border border-line-dark bg-white/[0.03] px-3 py-1 text-[12px] font-medium text-white/70">
            <span className="size-1.5 rounded-full bg-vermillion" />
            Multi-tenant · server-enforced isolation
          </div>
          <h2 className="max-w-md font-display text-[clamp(2rem,2.6vw,2.75rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-balance">
            {panelTitle}
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/60 text-pretty">
            {panelText}
          </p>
        </div>
      </div>
    </div>
  );
}
