import { route, parseJson, json } from "@/lib/api";
import { requireRole, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { updateTimetableSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// ADMIN manages any entry; TEACHER only their own (teacherId === self).
function scopeFor(role: string, id: string, userId: string) {
  return role === "ADMIN" ? { id } : { id, teacherId: userId };
}

// PATCH /api/timetable/[id]
export const PATCH = route(async (req, { params }) => {
  const user = await requireRole("ADMIN", "TEACHER");
  const { id } = await params;
  const input = await parseJson(req, updateTimetableSchema);
  const db = tenantDb(user.organizationId);
  const where = scopeFor(user.role, id, user.id);

  requireFound(await db.timetableEntry.findFirst({ where, select: { id: true } }));
  await db.timetableEntry.updateMany({ where, data: input });
  return json({ ok: true });
});

// DELETE /api/timetable/[id]
export const DELETE = route(async (_req, { params }) => {
  const user = await requireRole("ADMIN", "TEACHER");
  const { id } = await params;
  const db = tenantDb(user.organizationId);
  const where = scopeFor(user.role, id, user.id);

  requireFound(await db.timetableEntry.findFirst({ where, select: { id: true } }));
  await db.timetableEntry.deleteMany({ where });
  return json({ ok: true });
});
