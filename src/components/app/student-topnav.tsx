"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#notices", label: "Notices" },
  { href: "#assignments", label: "Assignments" },
  { href: "#timetable", label: "Timetable" },
  { href: "#notes", label: "Notes" },
];

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export function StudentTopNav({
  user,
  orgName,
}: {
  user: { name: string; roleLabel: string };
  orgName: string;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [active, setActive] = React.useState("overview");
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const ids = LINKS.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.5, 1] }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled ? "border-b border-line bg-paper/85 backdrop-blur-md" : "border-b border-transparent bg-paper"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
            S
          </span>
          <span className="max-w-[160px] truncate font-display text-[15px] font-bold tracking-tight">
            {orgName}
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "relative text-[13.5px] font-medium transition-colors",
                active === l.href.slice(1) ? "text-ink" : "text-body hover:text-ink"
              )}
            >
              {l.label}
              {active === l.href.slice(1) && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-vermillion" />
              )}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink ring-1 ring-line">
              {initials(user.name)}
            </span>
            <span className="text-[13px] text-body">
              {user.name.split(" ")[0]} · {user.roleLabel}
            </span>
          </span>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            aria-label="Log out"
            className="grid size-9 place-items-center rounded-md text-body transition-colors hover:bg-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="grid size-9 place-items-center rounded-md border border-line text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </nav>

      <dialog
        ref={dialogRef}
        className="m-0 w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:fixed open:inset-0"
        aria-label="Menu"
      >
        <div className="ml-auto flex h-full min-h-dvh w-[78%] max-w-xs flex-col bg-paper p-5">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-[15px] font-bold tracking-tight">{orgName}</span>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid size-9 place-items-center rounded-md border border-line"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => dialogRef.current?.close()}
                className="rounded-lg px-3 py-3 text-[16px] font-medium text-ink hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto border-t border-line pt-4">
            <div className="mb-2 flex items-center gap-2.5 px-1">
              <span className="grid size-8 place-items-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink ring-1 ring-line">
                {initials(user.name)}
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{user.name}</p>
                <p className="text-[11.5px] text-faint">{user.roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut({ redirectTo: "/" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] text-body transition-colors hover:bg-muted hover:text-ink"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </div>
      </dialog>
    </header>
  );
}
