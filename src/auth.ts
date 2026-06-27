import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { audit } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Plain findUnique on User by global-unique email is fine here: login happens
        // BEFORE we have a session, so there's no tenant context yet. The org is read
        // from the matched user and embedded into the JWT.
        const user = await prisma.user.findUnique({ where: { email } });

        // Generic failure for every case (bad email, bad password, inactive,
        // unverified) — never reveal which one.
        if (!user || !user.isActive || !user.emailVerified) {
          audit({ action: "auth.login", outcome: "failure", meta: { email, reason: "no-active-verified-user" } });
          return null;
        }

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) {
          audit({ action: "auth.login", outcome: "failure", actorId: user.id, organizationId: user.organizationId, meta: { email } });
          return null;
        }

        audit({ action: "auth.login", outcome: "success", actorId: user.id, organizationId: user.organizationId });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
});
