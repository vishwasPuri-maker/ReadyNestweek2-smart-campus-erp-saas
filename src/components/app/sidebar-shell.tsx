"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  StickyNote,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

// Student workspace nav — anchors scroll to the sections on the page.
const STUDENT_NAV: NavItem[] = [
  { href: "#top", label: "Dashboard", icon: LayoutDashboard },
  { href: "#notices", label: "Notices", icon: Bell },
  { href: "#assignments", label: "Assignments", icon: CheckSquare },
  { href: "#timetable", label: "Timetable", icon: CalendarDays },
  { href: "#notes", label: "Notes", icon: StickyNote },
];

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export function SidebarShell({
  user,
  orgName,
  subtitle,
  children,
}: {
  user: { name: string; roleLabel: string };
  orgName: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const items = STUDENT_NAV;

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        className="flex items-center gap-2 rounded px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
      >
        <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
          S
        </span>
        <span className="truncate font-display text-[15px] font-bold tracking-tight">
          {orgName}
        </span>
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => dialogRef.current?.close()}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion",
              i === 0 ? "bg-ink font-medium text-white" : "text-body hover:bg-muted hover:text-ink"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-4 rounded-lg border border-line bg-surface p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper font-mono text-[11px] font-semibold text-ink">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
            <p className="text-[11.5px] text-faint">{user.roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            aria-label="Log out"
            className="grid size-8 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-muted hover:text-ink"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[232px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-paper p-4 lg:flex">
        {Sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
            S
          </span>
          <span className="truncate font-display text-[14px] font-bold tracking-tight">
            {orgName}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="grid size-9 place-items-center rounded-md border border-line text-ink"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <dialog
        ref={dialogRef}
        className="m-0 w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:fixed open:inset-0"
        aria-label="Menu"
      >
        <div className="flex h-full min-h-dvh w-[78%] max-w-xs flex-col bg-paper p-4">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid size-9 place-items-center rounded-md border border-line"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          {Sidebar}
        </div>
      </dialog>

      <main className="min-w-0 px-5 py-7 sm:px-8 sm:py-9">
        <div className="mx-auto max-w-4xl">
          {subtitle}
          {children}
        </div>
      </main>
    </div>
  );
}
