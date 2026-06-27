import { route, parseJson, json } from "@/lib/api";
import { requireUser, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { updateNoteSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// All ops are scoped by { id, ownerId } (+ org via tenantDb) → IDOR-safe 404.
const ownWhere = (id: string, userId: string) => ({ id, ownerId: userId });

// GET /api/notes/[id]
export const GET = route(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const db = tenantDb(user.organizationId);
  const note = requireFound(await db.note.findFirst({ where: ownWhere(id, user.id) }));
  return json({ ok: true, note });
});

// PATCH /api/notes/[id]
export const PATCH = route(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const input = await parseJson(req, updateNoteSchema);
  const db = tenantDb(user.organizationId);

  requireFound(await db.note.findFirst({ where: ownWhere(id, user.id), select: { id: true } }));
  await db.note.updateMany({ where: ownWhere(id, user.id), data: input });
  return json({ ok: true });
});

// DELETE /api/notes/[id]
export const DELETE = route(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const db = tenantDb(user.organizationId);

  requireFound(await db.note.findFirst({ where: ownWhere(id, user.id), select: { id: true } }));
  await db.note.deleteMany({ where: ownWhere(id, user.id) });
  return json({ ok: true });
});
