"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "TEACHER" | "STUDENT";
type NavItem = { href: string; label: string; exact?: boolean };

const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview", exact: true },
    { href: "/admin/people", label: "People" },
    { href: "/admin/settings", label: "Settings" },
  ],
  TEACHER: [{ href: "/teacher", label: "Overview", exact: true }],
  STUDENT: [{ href: "/student", label: "Overview", exact: true }],
};

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function AppShell({
  user,
  orgName,
  children,
}: {
  user: { name: string; role: Role };
  orgName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const items = NAV[user.role];

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermillion"
            >
              <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
                S
              </span>
              <span className="max-w-[160px] truncate font-display text-[15px] font-bold tracking-tight">
                {orgName}
              </span>
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item) ? "page" : undefined}
                  className="relative flex h-16 items-center text-[14px] font-medium"
                >
                  <span
                    className={cn(
                      "transition-colors",
                      isActive(item) ? "text-ink" : "text-body hover:text-ink"
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive(item) && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-vermillion" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right — user + logout (desktop) */}
          <div className="hidden items-center gap-3 md:flex">
            <span className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink ring-1 ring-line">
                {initials(user.name)}
              </span>
              <span className="text-[13px] text-body">
                {user.name.split(" ")[0]} · {ROLE_LABEL[user.role]}
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

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => dialogRef.current?.showModal()}
            className="grid size-9 place-items-center rounded-md border border-line text-ink md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <dialog
        ref={dialogRef}
        className="m-0 w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:fixed open:inset-0"
        aria-label="Menu"
      >
        <div className="ml-auto flex h-full min-h-dvh w-[78%] max-w-xs flex-col bg-paper p-5">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-[15px] font-bold tracking-tight">
              {orgName}
            </span>
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
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => dialogRef.current?.close()}
                className={cn(
                  "rounded-lg px-3 py-3 text-[16px] font-medium transition-colors",
                  isActive(item) ? "bg-ink text-white" : "text-ink hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-line pt-4">
            <div className="mb-2 flex items-center gap-2.5 px-1">
              <span className="grid size-8 place-items-center rounded-full bg-surface font-mono text-[11px] font-semibold text-ink ring-1 ring-line">
                {initials(user.name)}
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{user.name}</p>
                <p className="text-[11.5px] text-faint">{ROLE_LABEL[user.role]}</p>
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        {children}
      </main>
    </div>
  );
}
