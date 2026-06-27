import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireUser, requireRole } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { parsePagination, paginated } from "@/lib/pagination";
import { createTimetableSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// GET /api/timetable — all roles can view their org's timetable.
export const GET = route(async (req) => {
  const user = await requireUser();
  const { skip, take, page, limit } = parsePagination(req);
  const db = tenantDb(user.organizationId);

  const [items, total] = await Promise.all([
    db.timetableEntry.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      skip,
      take,
    }),
    db.timetableEntry.count(),
  ]);
  return json({ ok: true, ...paginated(items, total, page, limit) });
});

// POST /api/timetable — ADMIN creates any entry; TEACHER may only create their own.
export const POST = route(async (req) => {
  const user = await requireRole("ADMIN", "TEACHER");
  const input = await parseJson(req, createTimetableSchema);
  if (input.endTime <= input.startTime) throw new HttpError(400, "endTime must be after startTime");

  // A teacher's entries are always pinned to themselves, regardless of input.
  const teacherId = user.role === "TEACHER" ? user.id : input.teacherId;

  const db = tenantDb(user.organizationId);
  const created = await db.timetableEntry.create({
    data: {
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      subject: input.subject,
      room: input.room,
      teacherId,
      branch: input.branch ?? null,
      section: input.section ?? null,
      organizationId: user.organizationId,
    },
  });
  return json({ ok: true, entry: created }, 201);
});
