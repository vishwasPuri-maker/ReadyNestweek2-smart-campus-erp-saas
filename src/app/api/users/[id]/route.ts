import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireRole, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { updateUserSchema } from "@/lib/validations/resources";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// PATCH /api/users/[id] — admin updates a user in their org (name/role/active).
export const PATCH = route(async (req, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const input = await parseJson(req, updateUserSchema);
  const db = tenantDb(admin.organizationId);

  // Tenant-scoped existence check (404 if another org's user or missing).
  const target = requireFound(
    await db.user.findFirst({ where: { id }, select: { id: true, role: true } }),
  );
  // Don't allow demoting/deactivating ADMINs through this endpoint.
  if (target.role === "ADMIN") throw new HttpError(403, "Cannot modify an admin account");

  await db.user.updateMany({ where: { id }, data: input });
  audit({ action: "user.update", actorId: admin.id, organizationId: admin.organizationId, targetId: id, meta: { ...input } });
  return json({ ok: true });
});

// DELETE /api/users/[id] — soft-delete (deactivate) a user in the admin's org.
export const DELETE = route(async (_req, { params }) => {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  if (id === admin.id) throw new HttpError(400, "You cannot deactivate yourself");
  const db = tenantDb(admin.organizationId);

  const target = requireFound(
    await db.user.findFirst({ where: { id }, select: { id: true, role: true } }),
  );
  if (target.role === "ADMIN") throw new HttpError(403, "Cannot deactivate an admin account");

  await db.user.updateMany({ where: { id }, data: { isActive: false } });
  audit({ action: "user.deactivate", actorId: admin.id, organizationId: admin.organizationId, targetId: id });
  return json({ ok: true });
});
