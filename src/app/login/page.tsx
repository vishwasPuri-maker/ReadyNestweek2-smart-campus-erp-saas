import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in — Smart Campus",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const sp = await searchParams;
  const verified = sp.verified === "1";
  const linkError = sp.error === "invalid-token";
  const roleParam = typeof sp.role === "string" ? sp.role.toLowerCase() : "";
  const roleHint =
    roleParam === "admin"
      ? "Admin"
      : roleParam === "teacher"
        ? "Teacher"
        : roleParam === "student"
          ? "Student"
          : null;

  return (
    <AuthShell
      panelTitle="Welcome back to your campus."
      panelText="Pick up where your college left off — every record scoped to you, every action enforced on the server."
    >
      <LoginForm verified={verified} linkError={linkError} roleHint={roleHint} />
    </AuthShell>
  );
}
