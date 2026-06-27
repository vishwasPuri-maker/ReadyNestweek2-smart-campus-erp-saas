import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/** Create a single-use email-verification token for `email`. Returns the raw token. */
export async function createVerificationToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  // Invalidate any previous tokens for this email, then issue a fresh one.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

/**
 * Consume a verification token. Returns the associated email if valid (and deletes it),
 * or null if missing/expired. Expired tokens are cleaned up.
 */
export async function consumeVerificationToken(token: string): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return null;
  }

  await prisma.verificationToken.delete({ where: { token } });
  return record.identifier;
}
