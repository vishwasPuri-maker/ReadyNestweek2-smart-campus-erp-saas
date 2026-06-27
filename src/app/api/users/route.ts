import * as argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { parsePagination, paginated } from "@/lib/pagination";
import { createUserSchema } from "@/lib/validations/resources";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

const PUBLIC_USER = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
} as const;

// GET /api/users — list users in the admin's org (paginated).
export const GET = route(async (req) => {
  const admin = await requireRole("ADMIN");
  const { skip, take, page, limit } = parsePagination(req);
  const db = tenantDb(admin.organizationId);

  const [items, total] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, skip, take, select: PUBLIC_USER }),
    db.user.count(),
  ]);
  return json({ ok: true, ...paginated(items, total, page, limit) });
});

// POST /api/users — admin creates a TEACHER or STUDENT in their org (pre-verified).
export const POST = route(async (req) => {
  const admin = await requireRole("ADMIN");
  const input = await parseJson(req, createUserSchema);

  // Email is globally unique; reject duplicates (authed admin action).
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw new HttpError(409, "Email already in use");

  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const db = tenantDb(admin.organizationId);
  const created = await db.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash,
      emailVerified: new Date(), // admin-created accounts are trusted/active immediately
      organizationId: admin.organizationId,
    },
    select: PUBLIC_USER,
  });
  audit({ action: "user.create", actorId: admin.id, organizationId: admin.organizationId, targetId: created.id, meta: { role: created.role } });

  return json({ ok: true, user: created }, 201);
});
