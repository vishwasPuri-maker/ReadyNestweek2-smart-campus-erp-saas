import * as React from "react";

/** Graphic empty state — an icon tile over a faint dot texture, so blank sections
 *  feel designed rather than bare. */
export function EmptyState({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-paper/50 px-6 py-12 text-center">
      <div
        aria-hidden
        className="dot-atlas pointer-events-none absolute inset-0 text-ink opacity-[0.05] [mask-image:radial-gradient(70%_70%_at_50%_25%,#000,transparent_75%)]"
      />
      <div className="relative">
        <span className="mx-auto grid size-12 place-items-center rounded-xl border border-line bg-surface text-vermillion shadow-soft">
          <Icon className="size-5" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-ink">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-[13.5px] leading-relaxed text-body">{sub}</p>
      </div>
    </div>
  );
}
