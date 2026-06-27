import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[32px] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink text-balance sm:text-[40px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[15px] text-body text-pretty">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
