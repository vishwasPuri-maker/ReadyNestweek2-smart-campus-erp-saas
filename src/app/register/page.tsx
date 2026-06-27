import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register your college — Smart Campus",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthShell
      panelTitle="Your college, yours alone."
      panelText="Notices, timetable, attendance, assignments, and notes — for admins, teachers, and students. Fully isolated from every other college, from the very first minute."
    >
      <RegisterForm />
    </AuthShell>
  );
}
