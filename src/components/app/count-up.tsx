"use client";

import * as React from "react";

/**
 * Animates a number 0 → value on mount. SSR-safe: React renders the final value
 * (correct without JS, no hydration mismatch); the animation runs imperatively via
 * textContent so it never fights React state. Honors prefers-reduced-motion.
 */
export function CountUp({
  value,
  durationMs = 900,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value === 0) {
      el.textContent = value.toLocaleString();
      return;
    }

    let raf = 0;
    const start = performance.now();
    el.textContent = "0";
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic, no bounce
      el.textContent = Math.round(value * eased).toLocaleString();
      if (p < 1) raf = requestAnimationFrame(step);
      else el.textContent = value.toLocaleString();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
    </span>
  );
}
