import * as React from "react";
import { redirect } from "next/navigation";
import { Bell, CalendarDays, CheckSquare, Megaphone, StickyNote } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tenantDb } from "@/lib/tenant";
import { classLabel, todayLabel, todayWeekday } from "@/lib/classes";
import { StudentTopNav } from "@/components/app/student-topnav";
import { SetClass } from "@/components/app/set-class";
import { TaskList } from "@/components/app/task-list";
import { NotesPanel } from "@/components/app/notes-panel";
import { TimetableView } from "@/components/app/timetable-view";
import { AttendanceDial } from "@/components/app/attendance-dial";
import { EmptyState } from "@/components/app/empty-state";
import { AttachmentChip } from "@/components/app/attachment-chip";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

function SectionBlock({
  id,
  label,
  icon: Icon,
  intro,
  children,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" id={id} className="mt-16 scroll-mt-24 border-t border-line pt-12">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-vermillion" />
        <p className="font-mono text-caption uppercase tracking-[0.2em] text-vermillion-ink">
          {label}
        </p>
      </div>
      <p className="mt-2 max-w-2xl text-body-lg text-body text-pretty">{intro}</p>
      <div className="mt-7">{children}</div>
    </Reveal>
  );
}

export default async function StudentHome() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const orgId = session.user.organizationId;
  const db = tenantDb(orgId);
  const [me, org] = await Promise.all([
    db.user.findFirst({ where: { id: session.user.id }, select: { branch: true, section: true } }),
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
  ]);
  const orgName = org?.name ?? "Smart Campus";
  const userName = session.user.name ?? "Student";

  if (!me?.branch || !me?.section) {
    return (
      <div className="relative flex min-h-dvh flex-col bg-surface">
        <div
          aria-hidden
          className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,#000_60%,transparent)]"
        />
        <StudentTopNav user={{ name: userName, roleLabel: "Student" }} orgName={orgName} />
        <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
          <SetClass role="STUDENT" />
        </main>
      </div>
    );
  }

  const branch = me.branch;
  const section = me.section;
  const sid = session.user.id;

  const [attTotal, attPresent, notices, tasksRaw, timetable, notesRaw] = await Promise.all([
    db.attendance.count({ where: { studentId: sid } }),
    db.attendance.count({ where: { studentId: sid, present: true } }),
    db.notice.findMany({
      where: { OR: [{ branch: null }, { branch, section }] },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, body: true, branch: true, attachment: true, createdAt: true, author: { select: { name: true } } },
    }),
    db.task.findMany({
      where: { ownerId: sid },
      orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      take: 50,
      select: { id: true, title: true, description: true, dueDate: true, completed: true, assignedById: true, attachment: true },
    }),
    db.timetableEntry.findMany({
      where: { branch, section },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      select: { dayOfWeek: true, startTime: true, endTime: true, subject: true, room: true },
    }),
    db.note.findMany({
      where: { ownerId: sid },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: { id: true, title: true, content: true, attachment: true },
    }),
  ]);

  const pct = attTotal === 0 ? 0 : Math.round((attPresent / attTotal) * 1000) / 10;
  const pending = tasksRaw.filter((t) => !t.completed).length;
  const tasks = tasksRaw.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.dueDate?.toISOString() ?? null,
    completed: t.completed,
    assigned: t.assignedById != null,
    attachment: t.attachment,
  }));
  const firstName = userName.split(" ")[0];
  const todayDow = todayWeekday();
  const todayClasses = timetable.filter((e) => e.dayOfWeek === todayDow).length;

  const noData = attTotal === 0;
  const statusText = noData ? "No classes recorded yet" : pct >= 75 ? "On track" : "Below 75% — attend more";
  const statusDanger = !noData && pct < 75;

  return (
    <div className="relative flex min-h-dvh flex-col bg-surface">
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,#000_60%,transparent)]"
      />
      <StudentTopNav user={{ name: userName, roleLabel: "Student" }} orgName={orgName} />

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        {/* Overview hero — text + a "today" snapshot card */}
        <Reveal as="section" id="overview" className="scroll-mt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(300px,380px)]">
            <div>
              <p className="font-mono text-caption uppercase tracking-[0.16em] text-faint">
                {todayLabel()} · <span className="text-vermillion-ink">{classLabel(branch, section)}</span>
              </p>
              <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink text-balance">
                Hi, {firstName}.
              </h1>
              <p className="mt-4 max-w-md text-body-lg text-body text-pretty">
                Everything for your class — notices, work, timetable, and your notes — in one place.
              </p>
            </div>

            {/* Snapshot card */}
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-float">
              <div
                aria-hidden
                className="dot-atlas pointer-events-none absolute inset-0 text-ink opacity-[0.04]"
              />
              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                  Today at a glance
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <AttendanceDial pct={Math.round(pct)} />
                  <div>
                    <p className={cn("text-[15px] font-bold tracking-tight", statusDanger ? "text-vermillion-ink" : "text-ink")}>
                      {statusText}
                    </p>
                    <p className="mt-0.5 text-[13px] text-body">
                      {attPresent} of {attTotal} present
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line bg-paper/60 p-3">
                    <p className="font-mono text-[22px] font-semibold tabular-nums text-ink">{pending}</p>
                    <p className="text-[11.5px] text-faint">Pending tasks</p>
                  </div>
                  <div className="rounded-lg border border-line bg-paper/60 p-3">
                    <p className="font-mono text-[22px] font-semibold tabular-nums text-ink">{todayClasses}</p>
                    <p className="text-[11.5px] text-faint">Today&apos;s classes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <SectionBlock
          id="notices"
          label="Notices"
          icon={Bell}
          intro="Announcements from your college and your class teacher — newest first."
        >
          {notices.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No notices yet"
              sub="When your college or teacher posts an announcement, it'll show up here."
            />
          ) : (
            <ul className="space-y-3">
              {notices.map((n) => (
                <li
                  key={n.id}
                  className="flex gap-3.5 rounded-xl border border-line bg-surface p-4 shadow-soft transition-shadow hover:shadow-float"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-paper text-vermillion">
                    <Megaphone className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-semibold text-ink">{n.title}</p>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-body">
                        {n.branch ? "Class" : "College"}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-body">{n.body}</p>
                    <AttachmentChip attachment={n.attachment} />
                    <p className="mt-1.5 text-[11.5px] text-faint">{n.author?.name ?? "Staff"}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionBlock>

        <SectionBlock
          id="assignments"
          label="Assignments"
          icon={CheckSquare}
          intro="Work assigned to your class — tick each one off as you finish it."
        >
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Nothing assigned yet"
              sub="Assignments from your teacher will appear here, with due dates to track."
            />
          ) : (
            <TaskList tasks={tasks} />
          )}
        </SectionBlock>

        <SectionBlock
          id="timetable"
          label="Timetable"
          icon={CalendarDays}
          intro="Your weekly class schedule. Today's classes are highlighted."
        >
          {timetable.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No classes scheduled"
              sub="Once your teacher sets up the timetable, your week will show up here."
            />
          ) : (
            <TimetableView entries={timetable} highlightDay={todayDow} />
          )}
        </SectionBlock>

        <SectionBlock
          id="notes"
          label="Notes"
          icon={StickyNote}
          intro="Your private space — jot down anything you need. Only you can see these."
        >
          <NotesPanel notes={notesRaw} />
        </SectionBlock>
      </main>
    </div>
  );
}
