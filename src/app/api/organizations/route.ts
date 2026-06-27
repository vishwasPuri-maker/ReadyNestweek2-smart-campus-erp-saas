import { prisma } from "@/lib/prisma";
import { route, parseJson, json } from "@/lib/api";
import { requireUser, requireRole } from "@/lib/authorize";
import { updateOrgSchema } from "@/lib/validations/resources";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// Organization is the tenant root (not a tenantDb model). Always key by the session's
// organizationId — never a client-supplied id (CRITICAL RULE #1).

// GET /api/organizations — the caller's own org (any role).
export const GET = route(async () => {
  const user = await requireUser();
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { id: true, name: true, slug: true, logoUrl: true, verified: true, createdAt: true },
  });
  return json({ ok: true, organization: org });
});

// PATCH /api/organizations — ADMIN updates org name/logo for their own org.
export const PATCH = route(async (req) => {
  const admin = await requireRole("ADMIN");
  const input = await parseJson(req, updateOrgSchema);

  await prisma.organization.update({
    where: { id: admin.organizationId },
    data: input,
  });
  audit({ action: "org.update", actorId: admin.id, organizationId: admin.organizationId, meta: { fields: Object.keys(input).join(",") } });
  return json({ ok: true });
});
