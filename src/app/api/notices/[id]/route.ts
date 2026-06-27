import { route, parseJson, json } from "@/lib/api";
import { requireRole, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { updateNoticeSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// A TEACHER may edit/delete only their own notices; an ADMIN may manage any in the org.
// Returns the org-scoped ownership filter (or just {id} for admins).
function scopeFor(role: string, id: string, userId: string) {
  return role === "ADMIN" ? { id } : { id, authorId: userId };
}

// PATCH /api/notices/[id]
export const PATCH = route(async (req, { params }) => {
  const user = await requireRole("ADMIN", "TEACHER");
  const { id } = await params;
  const input = await parseJson(req, updateNoticeSchema);
  const db = tenantDb(user.organizationId);
  const where = scopeFor(user.role, id, user.id);

  requireFound(await db.notice.findFirst({ where, select: { id: true } }));
  await db.notice.updateMany({ where, data: input });
  return json({ ok: true });
});

// DELETE /api/notices/[id]
export const DELETE = route(async (_req, { params }) => {
  const user = await requireRole("ADMIN", "TEACHER");
  const { id } = await params;
  const db = tenantDb(user.organizationId);
  const where = scopeFor(user.role, id, user.id);

  requireFound(await db.notice.findFirst({ where, select: { id: true } }));
  await db.notice.deleteMany({ where });
  return json({ ok: true });
});
