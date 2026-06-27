import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, parseJson, json } from "@/lib/api";
import { requireRole } from "@/lib/authorize";
import { genJoinCode } from "@/lib/codes";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const regenSchema = z.object({
  role: z.enum(["TEACHER", "STUDENT"]),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
  maxUses: z.number().int().min(1).max(100000).nullable().optional(),
});

// POST /api/organizations/invite-codes — ADMIN regenerates one role's join code with
// an optional expiry window and usage cap. Org is keyed by the session only.
export const POST = route(async (req) => {
  const admin = await requireRole("ADMIN");
  const { role, expiresInDays, maxUses } = await parseJson(req, regenSchema);

  const code = genJoinCode();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000)
    : null;

  await prisma.organization.update({
    where: { id: admin.organizationId },
    data:
      role === "TEACHER"
        ? {
            teacherCode: code,
            teacherCodeExpiresAt: expiresAt,
            teacherCodeMaxUses: maxUses ?? null,
            teacherCodeUses: 0,
          }
        : {
            studentCode: code,
            studentCodeExpiresAt: expiresAt,
            studentCodeMaxUses: maxUses ?? null,
            studentCodeUses: 0,
          },
  });

  audit({
    action: "org.invite_regenerate",
    actorId: admin.id,
    organizationId: admin.organizationId,
    meta: { role, expiresInDays: expiresInDays ?? null, maxUses: maxUses ?? null },
  });

  return json({
    ok: true,
    code,
    expiresAt: expiresAt?.toISOString() ?? null,
    maxUses: maxUses ?? null,
    uses: 0,
  });
});
