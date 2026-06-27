import { NextResponse } from "next/server";
import * as argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { joinSchema } from "@/lib/validations/auth";
import { authLimiter, rateLimitOk, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// POST /api/auth/join — self-serve join via a shareable code.
// Org AND role are resolved server-side from the code (never from the client),
// per CRITICAL RULE #1. The code may expire and/or cap how many people use it.
export async function POST(req: Request) {
  if (!(await rateLimitOk(authLimiter, `join:${clientIp(req)}`))) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }
  const { code, name, email, password } = parsed.data;

  const org = await prisma.organization.findFirst({
    where: { OR: [{ teacherCode: code }, { studentCode: code }] },
    select: {
      id: true,
      teacherCode: true,
      teacherCodeExpiresAt: true,
      teacherCodeMaxUses: true,
      teacherCodeUses: true,
      studentCode: true,
      studentCodeExpiresAt: true,
      studentCodeMaxUses: true,
      studentCodeUses: true,
    },
  });
  if (!org) {
    return NextResponse.json(
      { ok: false, message: "This invite link is invalid or has been revoked." },
      { status: 400 }
    );
  }

  const isTeacher = org.teacherCode === code;
  const role = isTeacher ? "TEACHER" : "STUDENT";
  const expiresAt = isTeacher ? org.teacherCodeExpiresAt : org.studentCodeExpiresAt;
  const maxUses = isTeacher ? org.teacherCodeMaxUses : org.studentCodeMaxUses;
  const uses = isTeacher ? org.teacherCodeUses : org.studentCodeUses;

  if (expiresAt && Date.now() > expiresAt.getTime()) {
    return NextResponse.json(
      { ok: false, message: "This invite link has expired. Ask your admin for a new one." },
      { status: 410 }
    );
  }
  if (maxUses != null && uses >= maxUses) {
    return NextResponse.json(
      { ok: false, message: "This invite link has reached its limit. Ask your admin for a new one." },
      { status: 403 }
    );
  }

  // Global-unique email.
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json(
      { ok: false, message: "That email is already in use." },
      { status: 409 }
    );
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await prisma.user.create({
    data: {
      organizationId: org.id,
      email,
      name,
      role,
      passwordHash,
      emailVerified: new Date(), // trust-the-code: active immediately
    },
    select: { id: true },
  });

  // Count the use against the code.
  await prisma.organization.update({
    where: { id: org.id },
    data: isTeacher
      ? { teacherCodeUses: { increment: 1 } }
      : { studentCodeUses: { increment: 1 } },
  });

  audit({ action: "user.join", organizationId: org.id, targetId: user.id, meta: { role } });

  return NextResponse.json({ ok: true });
}
