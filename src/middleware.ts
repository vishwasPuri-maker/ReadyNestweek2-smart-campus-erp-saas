import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Edge-safe NextAuth instance (no DB/argon2) — only reads the JWT.
const { auth } = NextAuth(authConfig);

// Route prefix → roles allowed to view it. This is a UX redirect layer ONLY; every
// API route re-checks auth + role server-side (CRITICAL RULE #3).
const GUARDS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/teacher", roles: ["TEACHER"] },
  { prefix: "/student", roles: ["STUDENT"] },
];

type Role = "ADMIN" | "TEACHER" | "STUDENT";

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;

  const guard = GUARDS.find((g) => nextUrl.pathname.startsWith(g.prefix));
  if (!guard) return; // unguarded path

  if (!user) {
    // Not logged in → send to login, remembering where they were going.
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (!guard.roles.includes(user.role)) {
    // Logged in but wrong role → bounce to their own dashboard root.
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Allowed — continue.
});

// Run middleware only on guarded sections (skips api, static assets, etc.).
export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/dashboard/:path*"],
};
