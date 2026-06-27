import { route, parseJson, json } from "@/lib/api";
import { requireUser } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { parsePagination, paginated } from "@/lib/pagination";
import { createNoteSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// GET /api/notes — only the caller's own notes.
export const GET = route(async (req) => {
  const user = await requireUser();
  const { skip, take, page, limit } = parsePagination(req);
  const db = tenantDb(user.organizationId);

  const where = { ownerId: user.id };
  const [items, total] = await Promise.all([
    db.note.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
    db.note.count({ where }),
  ]);
  return json({ ok: true, ...paginated(items, total, page, limit) });
});

// POST /api/notes — create a note owned by the caller.
export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, createNoteSchema);
  const db = tenantDb(user.organizationId);

  const created = await db.note.create({
    // organizationId is also enforced/overwritten by tenantDb; passed here to satisfy types.
    data: {
      title: input.title,
      content: input.content ?? "",
      attachment: input.attachment ?? undefined,
      ownerId: user.id,
      organizationId: user.organizationId,
    },
  });
  return json({ ok: true, note: created }, 201);
});
