import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

// Embed tenant + role into the session/JWT so every server check can read them
// without a DB hit (helps the <1s budget). organizationId here is ALWAYS the
// server-trusted value from login — never client input.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    organizationId: string;
  }
}

// JWT interface lives in @auth/core/jwt (next-auth/jwt only re-exports it), so the
// augmentation must target the real module to merge.
declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    organizationId: string;
  }
}
