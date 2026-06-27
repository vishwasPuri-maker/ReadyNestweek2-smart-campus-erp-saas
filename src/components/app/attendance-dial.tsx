"use client";

import * as React from "react";

/**
 * Attendance ring that fills from 0 → pct on mount (the % renders statically so
 * it's correct without JS and SSR-stable). Honors prefers-reduced-motion.
 */
export function AttendanceDial({ pct }: { pct: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.max(0, Math.min(100, pct)) / 100);

  const [offset, setOffset] = React.useState(c);
  const [animate, setAnimate] = React.useState(true);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => {
      if (reduce) setAnimate(false);
      setOffset(target);
    });
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <svg viewBox="0 0 120 120" className="size-28 shrink-0 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line)" strokeWidth="9" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="var(--color-vermillion)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{
          transition: animate ? "stroke-dashoffset 1.1s var(--ease-out-expo)" : "none",
        }}
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink font-mono"
        fontSize="24"
        fontWeight="600"
        transform="rotate(90 60 60)"
      >
        {pct}%
      </text>
    </svg>
  );
}
