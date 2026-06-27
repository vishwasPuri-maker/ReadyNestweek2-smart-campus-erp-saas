import * as argon2 from "argon2";
import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireUser, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { updateProfileSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// GET /api/profile — own profile.
export const GET = route(async () => {
  const user = await requireUser();
  const db = tenantDb(user.organizationId);
  const me = requireFound(
    await db.user.findFirst({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
  );
  return json({ ok: true, user: me });
});

// PATCH /api/profile — update own name and/or password.
export const PATCH = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, updateProfileSchema);
  const db = tenantDb(user.organizationId);

  const data: {
    name?: string;
    passwordHash?: string;
    branch?: string;
    section?: string;
  } = {};
  if (input.name) data.name = input.name;
  if (input.branch) data.branch = input.branch;
  if (input.section) data.section = input.section;

  if (input.newPassword) {
    const current = requireFound(
      await db.user.findFirst({ where: { id: user.id }, select: { passwordHash: true } }),
    );
    const ok = await argon2.verify(current.passwordHash, input.currentPassword!);
    if (!ok) throw new HttpError(400, "Current password is incorrect");
    data.passwordHash = await argon2.hash(input.newPassword, { type: argon2.argon2id });
  }

  if (Object.keys(data).length === 0) throw new HttpError(400, "Nothing to update");

  // updateMany is auto org-scoped by tenantDb; + id makes it this user only.
  await db.user.updateMany({ where: { id: user.id }, data });
  return json({ ok: true });
});
