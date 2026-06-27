import type { NextAuthConfig } from "next-auth";

// Edge-safe base config: NO database / argon2 here so it can run in middleware.
// The Credentials provider (which needs Prisma + argon2) is added in src/auth.ts.
// Route-prefix guarding lives in src/middleware.ts (single source of truth).
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // filled in src/auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
