"use client";

import * as React from "react";
import { Building2, GraduationCap, UserPlus } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Register your college",
    desc: "Sign up as the admin and confirm your email. Your college's own workspace is ready in minutes.",
  },
  {
    icon: UserPlus,
    title: "Invite your teachers",
    desc: "Add teachers by email. They accept, set a password, and can post notices and mark attendance right away.",
  },
  {
    icon: GraduationCap,
    title: "Add your students",
    desc: "Bring students in the same way. They instantly see their timetable, attendance, assignments, and notes.",
  },
];

const STEP_MS = 620;

export function GetStartedSteps() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [animate, setAnimate] = React.useState(true);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => {
        setAnimate(false);
        setInView(true);
      });
      return () => cancelAnimationFrame(raf);
    }

    // Scroll-triggered only: reveal the moment the section enters the viewport,
    // not on load/visit. No failsafe timer (that caused it to fire off-screen).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reveal = (i: number): React.CSSProperties =>
    animate
      ? {
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(12px)",
          transition: "opacity 0.85s var(--ease-out-expo), transform 0.85s var(--ease-out-expo)",
          transitionDelay: `${i * STEP_MS}ms`,
        }
      : {};

  const line = (i: number): React.CSSProperties => {
    // soft vermillion glow that's always on, so it grows along with the line
    const glow = {
      boxShadow:
        "0 0 9px 0 color-mix(in oklch, var(--color-vermillion) 50%, transparent)",
    };
    if (!animate) return glow;
    return {
      ...glow,
      transform: inView ? "scaleY(1)" : "scaleY(0)",
      transformOrigin: "top",
      transition: "transform 0.7s ease-out",
      transitionDelay: `${i * STEP_MS + 320}ms`,
    };
  };

  return (
    <div ref={ref} className="lg:sticky lg:top-28">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-vermillion">
        Get started
      </p>
      <h3 className="mt-3 font-display text-[clamp(1.6rem,3vw,2rem)] font-bold leading-tight tracking-tight text-ink text-balance">
        Up and running in three steps.
      </h3>

      <ol className="mt-8">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.title} className="flex gap-4">
              {/* rail: number + connecting line */}
              <div className="flex flex-col items-center">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white"
                  style={reveal(i)}
                >
                  {i + 1}
                </span>
                {!last && (
                  <span
                    className="mt-1 w-0.5 flex-1 rounded-full bg-vermillion"
                    style={line(i)}
                  />
                )}
              </div>

              {/* content */}
              <div className={last ? "" : "pb-9"} style={reveal(i)}>
                <div className="flex items-center gap-2">
                  <s.icon className="size-4 text-vermillion" />
                  <h4 className="text-[16px] font-semibold text-ink">{s.title}</h4>
                </div>
                <p className="mt-1.5 max-w-xs text-[14px] leading-relaxed text-body text-pretty">
                  {s.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
