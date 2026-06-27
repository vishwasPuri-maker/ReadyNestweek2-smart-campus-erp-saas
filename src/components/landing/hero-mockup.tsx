"use client";

import * as React from "react";
import {
  Bell,
  CalendarDays,
  Check,
  CheckSquare,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Animated hero dashboard. The app auto-navigates between sections so it
 * feels alive without jittering: the active sidebar item slides, and the
 * main panel crossfades between screens of equal height (no layout jump).
 * Honors prefers-reduced-motion by staying on the Dashboard.
 * ------------------------------------------------------------------ */

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Bell, label: "Notices" },
  { icon: CalendarDays, label: "Timetable" },
  { icon: CheckSquare, label: "Attendance" },
  { icon: Users, label: "People" },
];

const ITEM_STEP = 36; // h-8 (32px) + gap-1 (4px)

function WindowChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-float">
      <div className="flex items-center gap-2 border-b border-line bg-paper/60 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <div className="ml-3 flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1">
          <span className="size-1.5 rounded-full bg-vermillion" />
          <span className="font-mono text-[11px] text-faint">
            demo-college.smartcampus.app
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

function Head({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
          {eyebrow}
        </p>
        <h3 className="font-display text-[19px] font-bold leading-tight tracking-tight">
          {title}
        </h3>
      </div>
      <span className="shrink-0 rounded-md bg-vermillion px-2.5 py-1 text-[11px] font-semibold text-white">
        {action}
      </span>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
      {children}
    </div>
  );
}

function DashboardScreen() {
  return (
    <>
      <Head eyebrow="MONDAY · WEEK 12" title="Good morning, Demo College" action="+ New notice" />
      <div className="mb-3 grid grid-cols-3 gap-2.5">
        {[
          { k: "Attendance", v: "94.2%" },
          { k: "Active staff", v: "38" },
          { k: "Students", v: "1,204" },
        ].map((s) => (
          <div key={s.k} className="rounded-lg border border-line bg-surface px-3 py-2.5">
            <p className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{s.k}</p>
            <p className="mt-0.5 font-mono text-[18px] font-semibold tracking-tight text-ink">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-line">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <span className="text-[12.5px] font-semibold">Latest notices</span>
          <Bell className="size-3.5 text-faint" />
        </div>
        {[
          { t: "Mid-term timetable published", m: "2h ago", flag: true },
          { t: "Library closed this Saturday", m: "Yesterday" },
          { t: "Sports day — volunteers needed", m: "2 days ago" },
        ].map((n) => (
          <div key={n.t} className="flex items-center gap-2.5 border-b border-line px-3 py-2 last:border-0">
            <span className={cn("size-1.5 shrink-0 rounded-full", n.flag ? "bg-vermillion" : "bg-line")} />
            <span className="flex-1 truncate text-[12.5px] text-ink">{n.t}</span>
            <span className="font-mono text-[10.5px] text-faint">{n.m}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function NoticesScreen() {
  const items = [
    { t: "Mid-term timetable published", a: "A. Rao", m: "2h", flag: true },
    { t: "Library closed this Saturday", a: "M. Khan", m: "1d" },
    { t: "Sports day — volunteers needed", a: "P. Desai", m: "2d" },
    { t: "Fee submission window open", a: "A. Rao", m: "3d" },
  ];
  return (
    <>
      <Head eyebrow="NOTICE BOARD" title="Notices" action="+ New notice" />
      <div className="space-y-2">
        {items.map((n) => (
          <Row key={n.t}>
            <span className={cn("size-1.5 shrink-0 rounded-full", n.flag ? "bg-vermillion" : "bg-line")} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium text-ink">{n.t}</span>
              <span className="font-mono text-[10.5px] text-faint">{n.a}</span>
            </span>
            <span className="font-mono text-[10.5px] text-faint">{n.m}</span>
          </Row>
        ))}
      </div>
    </>
  );
}

function TimetableScreen() {
  const slots = [
    { time: "09:00", subj: "Physics", room: "Room 204" },
    { time: "10:00", subj: "Mathematics", room: "Room 112" },
    { time: "11:00", subj: "Chemistry", room: "Lab 2", now: true },
    { time: "12:00", subj: "English", room: "Room 108" },
  ];
  return (
    <>
      <Head eyebrow="MONDAY" title="Timetable" action="+ Add class" />
      <div className="space-y-2">
        {slots.map((s) => (
          <Row key={s.time}>
            <span className="font-mono text-[11px] text-faint">{s.time}</span>
            <span className="flex-1 text-[12.5px] font-medium text-ink">{s.subj}</span>
            {s.now && (
              <span className="rounded-full bg-vermillion/10 px-2 py-0.5 font-mono text-[9.5px] uppercase text-vermillion-ink">
                Now
              </span>
            )}
            <span className="text-[11px] text-faint">{s.room}</span>
          </Row>
        ))}
      </div>
    </>
  );
}

function AttendanceScreen() {
  const roll = [
    { n: "Aarav Sharma", present: true },
    { n: "Diya Mehta", present: true },
    { n: "Kabir Rao", present: false },
    { n: "Sara Patel", present: true },
  ];
  return (
    <>
      <Head eyebrow="CLASS 10-B · PHYSICS" title="Attendance" action="Mark all" />
      <div className="mb-2.5 flex items-center justify-between rounded-lg bg-paper px-3 py-2">
        <span className="text-[12px] text-body">Today · present</span>
        <span className="font-mono text-[12px] font-semibold text-ink">28 / 30</span>
      </div>
      <div className="space-y-2">
        {roll.map((s) => (
          <Row key={s.n}>
            <span className="flex-1 text-[12.5px] font-medium text-ink">{s.n}</span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-md border",
                s.present ? "border-vermillion bg-vermillion text-white" : "border-line text-transparent"
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          </Row>
        ))}
      </div>
    </>
  );
}

function PeopleScreen() {
  const people = [
    { n: "A. Rao", r: "Admin", s: "Active" },
    { n: "M. Khan", r: "Teacher", s: "Active" },
    { n: "P. Desai", r: "Teacher", s: "Invited" },
    { n: "S. Iyer", r: "Student", s: "Active" },
  ];
  return (
    <>
      <Head eyebrow="DIRECTORY · 1,242" title="People" action="+ Invite" />
      <div className="space-y-2">
        {people.map((p) => (
          <Row key={p.n}>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-paper font-mono text-[9.5px] font-semibold">
              {p.n.split(" ").map((w) => w[0]).join("")}
            </span>
            <span className="flex-1 text-[12.5px] font-medium text-ink">{p.n}</span>
            <span className="text-[11px] text-faint">{p.r}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px]",
                p.s === "Invited" ? "bg-vermillion/10 text-vermillion-ink" : "bg-muted text-body"
              )}
            >
              {p.s}
            </span>
          </Row>
        ))}
      </div>
    </>
  );
}

const SCREENS = [
  DashboardScreen,
  NoticesScreen,
  TimetableScreen,
  AttendanceScreen,
  PeopleScreen,
];

export function HeroMockup() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % NAV.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <WindowChrome>
      <div className="grid grid-cols-1 sm:grid-cols-[176px_1fr]">
        {/* Sidebar */}
        <aside className="hidden flex-col gap-1 border-r border-line bg-paper/40 p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-1.5">
            <span className="grid size-6 place-items-center rounded-md bg-ink text-[13px] font-bold text-white">
              S
            </span>
            <span className="text-[13px] font-semibold tracking-tight">Smart Campus</span>
          </div>

          {/* nav with sliding active indicator */}
          <nav className="relative flex flex-col gap-1">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-md bg-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ transform: `translateY(${active * ITEM_STEP}px)` }}
            />
            {NAV.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "relative z-[1] flex h-8 items-center gap-2 rounded-md px-2 text-[12.5px] transition-colors duration-300",
                  active === i ? "font-medium text-white" : "text-body"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-paper font-mono text-[10px] font-semibold">
              AR
            </span>
            <span className="text-[11.5px] text-body">A. Rao · Admin</span>
          </div>
        </aside>

        {/* Main — crossfading screens of equal height */}
        <div className="p-4 sm:p-5">
          <div className="relative h-[258px]">
            {SCREENS.map((Screen, i) => (
              <div
                key={i}
                aria-hidden={active !== i}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
                  active === i ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                <Screen />
              </div>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}
