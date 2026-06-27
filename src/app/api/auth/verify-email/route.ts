import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/tokens";

export const runtime = "nodejs";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "";

// Email link click (GET). On success: mark the user verified + activate their org,
// then redirect to login. On failure: redirect to login with an error flag.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid-token`);
  }

  const email = await consumeVerificationToken(token);
  if (!email) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid-token`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, organizationId: true, emailVerified: true },
  });
  if (!user) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid-token`);
  }

  // Verify the user and activate the org (first verified user = org admin).
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } }),
    prisma.organization.update({ where: { id: user.organizationId }, data: { verified: true } }),
  ]);

  return NextResponse.redirect(`${appUrl()}/login?verified=1`);
}
