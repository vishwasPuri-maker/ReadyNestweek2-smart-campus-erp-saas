"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGIN_ROLES = [
  { value: "admin", label: "an admin" },
  { value: "teacher", label: "a teacher" },
  { value: "student", label: "a student" },
];

const links = [
  { href: "#isolation", label: "Isolation" },
  { href: "#roles", label: "Roles" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#trust", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

export function Nav({ authed = false }: { authed?: boolean }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => dialogRef.current?.showModal();
  const closeMenu = () => dialogRef.current?.close();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[40] transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Smart Campus home">
          <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
            S
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight">
            Smart Campus
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded text-[13.5px] font-medium text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermillion"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-vermillion px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <div
                className="relative"
                onMouseEnter={() => setLoginOpen(true)}
                onMouseLeave={() => setLoginOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setLoginOpen((o) => !o)}
                  aria-expanded={loginOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-1 rounded-md px-3.5 py-2 text-[13.5px] font-medium text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
                >
                  Log in
                  <ChevronDown
                    className={cn("size-3.5 transition-transform", loginOpen && "rotate-180")}
                  />
                </button>
                {loginOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-[60] mt-1 w-52 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-float"
                  >
                    {LOGIN_ROLES.map((r) => (
                      <Link
                        key={r.value}
                        role="menuitem"
                        href={`/login?role=${r.value}`}
                        className="block rounded-lg px-3 py-2 text-[13.5px] font-medium text-body transition-colors hover:bg-muted hover:text-ink"
                      >
                        Log in as {r.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/register"
                className="rounded-md bg-vermillion px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
              >
                Register your college
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={openMenu}
          className="grid size-9 place-items-center rounded-md border border-line text-ink md:hidden"
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
        <div className="ml-auto flex h-full min-h-dvh w-full max-w-xs flex-col bg-paper p-5">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-[15px] font-bold tracking-tight">
              Smart Campus
            </span>
            <button
              type="button"
              onClick={closeMenu}
              className="grid size-9 place-items-center rounded-md border border-line"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-[16px] font-medium text-ink hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2.5">
            {authed ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="rounded-lg bg-vermillion py-3 text-center text-[15px] font-semibold text-white"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                {LOGIN_ROLES.map((r) => (
                  <Link
                    key={r.value}
                    href={`/login?role=${r.value}`}
                    onClick={closeMenu}
                    className="rounded-lg border border-line py-3 text-center text-[15px] font-semibold text-ink"
                  >
                    Log in as {r.label}
                  </Link>
                ))}
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-lg bg-vermillion py-3 text-center text-[15px] font-semibold text-white"
                >
                  Register your college
                </Link>
              </>
            )}
          </div>
        </div>
      </dialog>
    </header>
  );
}
