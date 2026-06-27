import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";
import { HttpError } from "@/lib/api";

export type SessionUser = {
  id: string;
  role: Role;
  organizationId: string;
  email?: string | null;
  name?: string | null;
};

/**
 * Require an authenticated user. Returns the session user (with id, role,
 * organizationId — all server-trusted from the JWT). Throws 401 otherwise.
 *
 * EVERY protected Route Handler must call this (or requireRole). Middleware is UX
 * only and is NOT the security boundary (CRITICAL RULE #3).
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new HttpError(401, "Unauthorized");
  return session.user as SessionUser;
}

/** Require an authenticated user whose role is one of `allowed`. Throws 401/403. */
export async function requireRole(...allowed: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) throw new HttpError(403, "Forbidden");
  return user;
}

/**
 * IDOR guard: pass the result of a tenant-scoped findFirst (already filtered by
 * { id, organizationId, [ownerId] }). Throws 404 if nothing was found, so callers
 * can't distinguish "doesn't exist" from "belongs to another tenant/user".
 */
export function requireFound<T>(record: T | null | undefined): T {
  if (record == null) throw new HttpError(404, "Not found");
  return record;
}
