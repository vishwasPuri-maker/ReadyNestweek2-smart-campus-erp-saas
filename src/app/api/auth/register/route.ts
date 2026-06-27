import { NextResponse } from "next/server";
import * as argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { authLimiter, rateLimitOk, clientIp } from "@/lib/ratelimit";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// Generic response — never reveals whether the email/org already exists (anti-enumeration).
const GENERIC_OK = NextResponse.json({
  ok: true,
  message: "If the email is available, a verification link has been sent.",
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "org";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.organization.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(req: Request) {
  if (!(await rateLimitOk(authLimiter, `register:${clientIp(req)}`))) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }
  const { organizationName, name, email, password } = parsed.data;

  // If email already exists, return the same generic OK without creating/sending.
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return GENERIC_OK;

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const slug = await uniqueSlug(slugify(organizationName));

  // First user of a new org becomes its ADMIN. Org + admin created atomically.
  const { orgId, adminId } = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: organizationName, slug, verified: false },
    });
    const admin = await tx.user.create({
      data: {
        organizationId: org.id,
        email,
        name,
        passwordHash,
        role: "ADMIN",
        emailVerified: null,
      },
    });
    return { orgId: org.id, adminId: admin.id };
  });
  audit({ action: "org.register", organizationId: orgId, actorId: adminId, meta: { slug } });

  const token = await createVerificationToken(email);
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/auth/verify-email?token=${token}`;
  try {
    await sendVerificationEmail(email, verifyUrl);
  } catch {
    // Account exists but email failed — user can request a resend. Don't 500.
  }

  return GENERIC_OK;
}
