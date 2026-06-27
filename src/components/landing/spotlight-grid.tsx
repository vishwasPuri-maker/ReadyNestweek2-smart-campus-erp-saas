"use client";

import * as React from "react";

/**
 * Interactive grid background. Reuses the hero's `grid-lines` motif, but reveals
 * it as a spotlight that follows the cursor across the parent section. Mouse
 * position is written to CSS variables directly (no React re-renders), so it stays
 * smooth. The whole layer is pointer-events-none and decorative.
 */
export function SpotlightGrid() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const wrap = ref.current;
    const parent = wrap?.parentElement;
    if (!wrap || !parent) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = parent.getBoundingClientRect();
        wrap.style.setProperty("--mx", `${e.clientX - r.left}px`);
        wrap.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    const onEnter = () => wrap.style.setProperty("--spot", "1");
    const onLeave = () => wrap.style.setProperty("--spot", "0");

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
    >
      {/* grid revealed near the cursor */}
      <div
        className="grid-lines absolute inset-0"
        style={{
          opacity: "var(--spot, 0)",
          transition: "opacity 450ms ease",
          maskImage:
            "radial-gradient(460px circle at var(--mx) var(--my), #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(460px circle at var(--mx) var(--my), #000 0%, transparent 80%)",
        }}
      />
      {/* soft vermillion glow trailing the cursor */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--spot, 0)",
          transition: "opacity 450ms ease",
          background:
            "radial-gradient(300px circle at var(--mx) var(--my), color-mix(in oklch, var(--color-vermillion) 2%, transparent) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
