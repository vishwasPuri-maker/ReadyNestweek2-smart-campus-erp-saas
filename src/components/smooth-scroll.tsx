"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, type LenisRef } from "lenis/react";

/**
 * App-wide smooth scrolling (the buttery momentum feel premium sites use), via
 * Lenis. It smooths the real native scroll — so sticky/fixed elements,
 * IntersectionObserver reveals, and scroll listeners keep working untouched.
 * Respects prefers-reduced-motion (falls back to native scroll), and smooth-scrolls
 * in-page anchor links (#roles, #faq, …) via the `anchors` option.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = React.useState(false);
  const lenisRef = React.useRef<LenisRef>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    const raf = requestAnimationFrame(apply);
    mq.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", apply);
    };
  }, []);

  // On client-side navigation the page height changes; reset to top and recompute
  // Lenis dimensions, otherwise it keeps the previous route's scroll bounds (which
  // can lock scrolling on a taller page, e.g. landing after login).
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      lenis.scrollTo(0, { immediate: true });
      lenis.resize();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const options = React.useMemo(
    () => ({
      lerp: 0.1,
      smoothWheel: !reduced,
      anchors: true,
    }),
    [reduced]
  );

  return (
    <ReactLenis ref={lenisRef} root options={options}>
      {children}
    </ReactLenis>
  );
}
