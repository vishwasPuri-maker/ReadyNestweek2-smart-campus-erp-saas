import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireUser, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { updateTaskSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// PATCH /api/tasks/[id]
//   - personal task (owner, no assigner): owner edits everything
//   - assigned task: assigner edits title/desc/due; owner may only toggle `completed`
export const PATCH = route(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const input = await parseJson(req, updateTaskSchema);
  const db = tenantDb(user.organizationId);

  const task = requireFound(
    await db.task.findFirst({ where: { id }, select: { id: true, ownerId: true, assignedById: true } }),
  );
  const isOwner = task.ownerId === user.id;
  const isAssigner = task.assignedById === user.id;
  if (!isOwner && !isAssigner) throw new HttpError(404, "Not found");

  const personal = task.assignedById === null;
  const data: Record<string, unknown> = {};

  if (input.completed !== undefined) {
    if (!isOwner) throw new HttpError(403, "Only the task owner can change completion");
    data.completed = input.completed;
  }
  for (const field of ["title", "description", "dueDate"] as const) {
    if (input[field] !== undefined) {
      // Editing content is allowed for the assigner, or the owner of a personal task.
      if (!(isAssigner || (isOwner && personal))) {
        throw new HttpError(403, "Not allowed to edit this task");
      }
      data[field] = input[field];
    }
  }
  if (Object.keys(data).length === 0) throw new HttpError(400, "Nothing to update");

  await db.task.updateMany({ where: { id }, data });
  return json({ ok: true });
});

// DELETE /api/tasks/[id] — assigner can delete an assignment; owner can delete a personal task.
export const DELETE = route(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const db = tenantDb(user.organizationId);

  const task = requireFound(
    await db.task.findFirst({ where: { id }, select: { id: true, ownerId: true, assignedById: true } }),
  );
  const canDelete =
    task.assignedById === user.id || (task.assignedById === null && task.ownerId === user.id);
  if (!canDelete) throw new HttpError(403, "Not allowed to delete this task");

  await db.task.deleteMany({ where: { id } });
  return json({ ok: true });
});
