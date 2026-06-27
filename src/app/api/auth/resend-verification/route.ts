import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { authLimiter, rateLimitOk, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

const schema = z.object({ email: z.email().trim().toLowerCase() });

// Re-send a verification link. Generic response regardless of whether the email exists
// or is already verified (anti-enumeration).
export async function POST(req: Request) {
  if (!(await rateLimitOk(authLimiter, `resend:${clientIp(req)}`))) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { emailVerified: true },
  });

  if (user && !user.emailVerified) {
    const token = await createVerificationToken(parsed.data.email);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/auth/verify-email?token=${token}`;
    try {
      await sendVerificationEmail(parsed.data.email, verifyUrl);
    } catch {
      /* swallow — generic response below */
    }
  }

  return NextResponse.json({
    ok: true,
    message: "If the account exists and is unverified, a new link has been sent.",
  });
}
