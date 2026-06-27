import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tenantDb } from "@/lib/tenant";
import { classLabel } from "@/lib/classes";
import { AppShell } from "@/components/app/app-shell";
import { SetClass } from "@/components/app/set-class";
import { AttendanceMarker } from "@/components/app/attendance-marker";
import { NoticeComposer } from "@/components/app/class-composers";
import { AssignmentComposer } from "@/components/app/class-composers";
import { TimetableComposer } from "@/components/app/timetable-composer";
import { TimetableView } from "@/components/app/timetable-view";
import { AttachmentChip } from "@/components/app/attachment-chip";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-caption uppercase tracking-[0.2em] text-faint">
      {children}
    </h2>
  );
}

export default async function TeacherHome() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const orgId = session.user.organizationId;
  const db = tenantDb(orgId);
  const [me, org] = await Promise.all([
    db.user.findFirst({ where: { id: session.user.id }, select: { branch: true, section: true } }),
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
  ]);
  const orgName = org?.name ?? "Smart Campus";
  const userName = session.user.name ?? "Teacher";

  if (!me?.branch || !me?.section) {
    return (
      <AppShell user={{ name: userName, role: "TEACHER" }} orgName={orgName}>
        <SetClass role="TEACHER" />
      </AppShell>
    );
  }

  const branch = me.branch;
  const section = me.section;

  const [students, notices, assignedRaw, timetable] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT", branch, section, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.notice.findMany({
      where: { OR: [{ branch: null }, { branch, section }] },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        body: true,
        branch: true,
        attachment: true,
        createdAt: true,
        author: { select: { name: true, role: true } },
      },
    }),
    db.task.findMany({
      where: { assignedById: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { title: true, dueDate: true, completed: true, attachment: true },
    }),
    db.timetableEntry.findMany({
      where: { branch, section },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      select: { dayOfWeek: true, startTime: true, endTime: true, subject: true, room: true },
    }),
  ]);

  // Group per-student tasks back into assignments.
  const map = new Map<
    string,
    { title: string; dueDate: Date | null; total: number; done: number; attachment: unknown }
  >();
  for (const t of assignedRaw) {
    const key = `${t.title}|${t.dueDate?.toISOString() ?? ""}`;
    const g = map.get(key) ?? { title: t.title, dueDate: t.dueDate, total: 0, done: 0, attachment: t.attachment };
    g.total += 1;
    if (t.completed) g.done += 1;
    map.set(key, g);
  }
  const assignments = [...map.values()].slice(0, 6);
  const firstName = userName.split(" ")[0];

  return (
    <AppShell user={{ name: userName, role: "TEACHER" }} orgName={orgName}>
      <div className="mb-12">
        <p className="font-mono text-caption uppercase tracking-[0.2em] text-vermillion-ink">
          {classLabel(branch, section)}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink text-balance">
          Hi, {firstName}.
        </h1>
        <p className="mt-2 text-body-lg text-body">
          {students.length} {students.length === 1 ? "student" : "students"} in your class.
        </p>
      </div>

      <section className="mb-14">
        <SectionLabel>Attendance · today</SectionLabel>
        <AttendanceMarker students={students} />
      </section>

      <section className="mb-14">
        <SectionLabel>Post a notice</SectionLabel>
        <NoticeComposer />
        {notices.length > 0 && (
          <ul className="mt-6 border-t border-line">
            {notices.map((n) => (
              <li key={n.id} className="border-b border-line py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14.5px] font-semibold text-ink">{n.title}</p>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-body">
                    {n.branch ? "Class" : "Org"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-body">{n.body}</p>
                <AttachmentChip attachment={n.attachment} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-14">
        <SectionLabel>Assign work</SectionLabel>
        <AssignmentComposer />
        {assignments.length > 0 && (
          <ul className="mt-6 border-t border-line">
            {assignments.map((a, i) => (
              <li key={i} className="border-b border-line py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium text-ink">{a.title}</p>
                    {a.dueDate && (
                      <p className="font-mono text-[11.5px] text-faint">
                        Due {a.dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-[12.5px] text-body">
                    {a.done}/{a.total} done
                  </span>
                </div>
                <AttachmentChip attachment={a.attachment} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionLabel>Timetable</SectionLabel>
        <TimetableComposer branch={branch} section={section} />
        <TimetableView entries={timetable} />
      </section>
    </AppShell>
  );
}
