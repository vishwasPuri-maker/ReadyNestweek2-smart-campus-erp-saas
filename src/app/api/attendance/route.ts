import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireUser, requireRole, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { parsePagination, paginated } from "@/lib/pagination";
import { markAttendanceSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// Normalize to UTC midnight so attendance is keyed per-day, not per-timestamp.
function toDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// GET /api/attendance
//  - STUDENT: only their own records + summary % (cannot see others).
//  - TEACHER/ADMIN: org records, optional ?studentId filter.
export const GET = route(async (req) => {
  const user = await requireUser();
  const { skip, take, page, limit } = parsePagination(req);
  const db = tenantDb(user.organizationId);
  const sp = new URL(req.url).searchParams;

  const studentId =
    user.role === "STUDENT" ? user.id : sp.get("studentId") ?? undefined;

  const where = studentId ? { studentId } : {};

  const [items, total, presentCount] = await Promise.all([
    db.attendance.findMany({ where, orderBy: { date: "desc" }, skip, take }),
    db.attendance.count({ where }),
    db.attendance.count({ where: { ...where, present: true } }),
  ]);

  const summary =
    studentId !== undefined
      ? {
          total,
          present: presentCount,
          percentage: total === 0 ? 0 : Math.round((presentCount / total) * 1000) / 10,
        }
      : null;

  return json({ ok: true, summary, ...paginated(items, total, page, limit) });
});

// POST /api/attendance — TEACHER marks attendance (idempotent per student/day/subject).
export const POST = route(async (req) => {
  const teacher = await requireRole("TEACHER");
  const input = await parseJson(req, markAttendanceSchema);
  const db = tenantDb(teacher.organizationId);

  const me = await db.user.findFirst({
    where: { id: teacher.id },
    select: { branch: true, section: true },
  });
  if (!me?.branch || !me?.section) throw new HttpError(400, "Set your class first");

  // Student must exist AND be in this teacher's branch+section (else 404 — IDOR guard).
  requireFound(
    await db.user.findFirst({
      where: {
        id: input.studentId,
        role: "STUDENT",
        branch: me.branch,
        section: me.section,
      },
      select: { id: true },
    }),
  );
  if (input.subject === undefined) {
    // keep null distinct handling simple: a subject is required to key the record
    throw new HttpError(400, "subject is required");
  }

  const day = toDay(input.date);
  const existing = await db.attendance.findFirst({
    where: { studentId: input.studentId, date: day, subject: input.subject },
    select: { id: true },
  });

  if (existing) {
    await db.attendance.updateMany({
      where: { id: existing.id },
      data: { present: input.present, markedById: teacher.id },
    });
  } else {
    await db.attendance.create({
      data: {
        studentId: input.studentId,
        markedById: teacher.id,
        date: day,
        present: input.present,
        subject: input.subject,
        organizationId: teacher.organizationId,
      },
    });
  }
  return json({ ok: true });
});
