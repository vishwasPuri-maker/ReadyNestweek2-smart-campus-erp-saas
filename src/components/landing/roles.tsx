import {
  Check,
  GraduationCap,
  Smartphone,
  UserCog,
} from "lucide-react";
import { Reveal } from "./reveal";
import { SpotlightGrid } from "./spotlight-grid";
import { AttendanceRing, RolePanel } from "./mockups";
import { cn } from "@/lib/utils";

function AdminPanel() {
  const people = [
    { n: "A. Rao", r: "Admin", s: "Active" },
    { n: "M. Khan", r: "Teacher", s: "Active" },
    { n: "P. Desai", r: "Teacher", s: "Invited" },
    { n: "S. Iyer", r: "Student", s: "Active" },
  ];
  return (
    <RolePanel title="People" badge="Admin">
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-line bg-paper/60 px-3 py-2 font-mono text-[10.5px] uppercase tracking-wide text-faint">
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
        </div>
        {people.map((p) => (
          <div
            key={p.n}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line px-3 py-2 text-[12.5px] last:border-0"
          >
            <span className="font-medium text-ink">{p.n}</span>
            <span className="text-body">{p.r}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px]",
                p.s === "Invited"
                  ? "bg-vermillion/10 text-vermillion-ink"
                  : "bg-muted text-body"
              )}
            >
              {p.s}
            </span>
          </div>
        ))}
      </div>
      <button className="mt-3 w-full rounded-lg bg-ink py-2 text-[12.5px] font-semibold text-white">
        Invite teacher
      </button>
    </RolePanel>
  );
}

function TeacherPanel() {
  const roll = [
    { n: "Aarav S.", present: true },
    { n: "Diya M.", present: true },
    { n: "Kabir R.", present: false },
    { n: "Sara P.", present: true },
  ];
  return (
    <RolePanel title="Class 10-B · Physics" badge="Teacher">
      <div className="space-y-1.5">
        {roll.map((s) => (
          <div
            key={s.n}
            className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
          >
            <span className="text-[12.5px] font-medium text-ink">{s.n}</span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-md border",
                s.present
                  ? "border-vermillion bg-vermillion text-white"
                  : "border-line text-transparent"
              )}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-paper px-3 py-2">
        <span className="text-[12px] text-body">Marked</span>
        <span className="font-mono text-[12px] font-semibold text-ink">3 / 4 present</span>
      </div>
    </RolePanel>
  );
}

function StudentPanel() {
  return (
    <RolePanel title="My day" badge="Student">
      <div className="flex items-center gap-4">
        <AttendanceRing pct={94} />
        <div className="flex-1 space-y-1.5">
          {[
            { t: "09:00", s: "Physics", r: "Room 204" },
            { t: "10:00", s: "Mathematics", r: "Room 112" },
          ].map((c) => (
            <div
              key={c.t}
              className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-1.5"
            >
              <span className="font-mono text-[11px] text-faint">{c.t}</span>
              <span className="text-[12px] font-medium text-ink">{c.s}</span>
              <span className="ml-auto text-[11px] text-faint">{c.r}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-vermillion/8 px-3 py-2">
        <span className="flex size-4 items-center justify-center rounded-[4px] border border-vermillion text-vermillion">
          <Check className="size-3" strokeWidth={3} />
        </span>
        <span className="text-[12px] text-body">Submit chemistry assignment</span>
        <span className="ml-auto font-mono text-[10.5px] text-vermillion-ink">
          Due today
        </span>
      </div>
    </RolePanel>
  );
}

const roles = [
  {
    icon: UserCog,
    eyebrow: "For the admin",
    title: "Set up the college, run it with confidence.",
    body: "Register the institution, invite teachers and students, and manage org settings. High-stakes actions, made deliberate and reversible — with a full audit trail behind every change.",
    points: ["Invite & deactivate users", "Org-wide settings", "Everything audit-logged"],
    panel: <AdminPanel />,
    context: "Office desk · occasional, high-stakes",
  },
  {
    icon: GraduationCap,
    eyebrow: "For the teacher",
    title: "Mark, post, and move on to the next class.",
    body: "Attendance, notices, assignments, and timetable for your classes — fast, repeatable actions designed for the ninety seconds between periods, not a training course.",
    points: ["One-tap attendance", "Post notices to your classes", "Assign & track work"],
    panel: <TeacherPanel />,
    context: "Between classes · quick, daily",
  },
  {
    icon: Smartphone,
    eyebrow: "For the student",
    title: "Today, at a glance, in your pocket.",
    body: "Timetable, attendance percentage, assigned work, and private notes — a light, mobile-first view of exactly what matters today. Nothing they don’t need, nothing they can’t reach.",
    points: ["Live attendance %", "Today's timetable", "Tasks & private notes"],
    panel: <StudentPanel />,
    context: "On mobile · frequent, light",
  },
];

export function Roles() {
  return (
    <section
      id="roles"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      <SpotlightGrid />
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-balance">
            Built for all three. None an afterthought.
          </h2>
          <p className="mt-4 text-body-lg text-body text-pretty">
            Admin, teacher, and student each get a focused experience shaped around
            how they actually work — context, frequency, and device included.
          </p>
        </Reveal>

        <div className="mt-16 space-y-20 sm:space-y-28">
        {roles.map((role, i) => {
          const flip = i % 2 === 1;
          return (
            <Reveal
              key={role.eyebrow}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className={cn(flip && "lg:order-2")}>
                <div className="inline-flex items-center gap-2 text-faint">
                  <role.icon className="size-4 text-vermillion" />
                  <span className="font-mono text-[12px] uppercase tracking-[0.16em]">
                    {role.eyebrow}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[clamp(1.85rem,5.5vw,2.875rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink text-balance">
                  {role.title}
                </h3>
                <p className="mt-4 max-w-md text-body-lg text-body text-pretty">
                  {role.body}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {role.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-[14.5px] text-ink">
                      <span className="grid size-5 place-items-center rounded-full bg-ink text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 font-mono text-[11.5px] uppercase tracking-wide text-faint">
                  {role.context}
                </p>
              </div>
              <div className={cn(flip && "lg:order-1")}>{role.panel}</div>
            </Reveal>
          );
        })}
        </div>
      </div>
    </section>
  );
}
