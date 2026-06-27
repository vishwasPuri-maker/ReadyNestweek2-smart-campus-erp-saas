"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  /** delay in ms before the element animates in */
  delay?: number;
};

/**
 * Reveal-on-scroll wrapper. The content is visible by default (see globals.css:
 * `[data-reveal] { opacity: 1 }`); the hidden start-state only applies when motion
 * is allowed AND JS has hydrated. A failsafe timer force-reveals everything so the
 * section never ships blank in a headless renderer or if the observer misbehaves.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Under reduced-motion the hidden start-state CSS never applies, so the content
    // is already visible — nothing to toggle.
    if (reduce) return;

    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(t);
    }

    const failsafe = window.setTimeout(() => setShown(true), 1400);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    io.observe(el);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={cn(shown && "is-in", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}
