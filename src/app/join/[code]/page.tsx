import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/auth/auth-shell";
import { JoinForm } from "@/components/auth/join-form";

export const metadata: Metadata = {
  title: "Join — Smart Campus",
};

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const org = await prisma.organization.findFirst({
    where: { OR: [{ teacherCode: code }, { studentCode: code }] },
    select: { name: true, teacherCode: true, studentCode: true },
  });

  if (!org) {
    return (
      <AuthShell
        panelTitle="One campus, sealed off."
        panelText="Every college runs its own private workspace on Smart Campus."
      >
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">
            This link doesn&apos;t work
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-body">
            The invite link is invalid or has been revoked. Ask your college admin
            for a fresh link.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 items-center rounded-lg border border-line bg-surface px-5 text-[14px] font-semibold text-ink transition-colors hover:bg-muted"
          >
            Go to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  const role = org.teacherCode === code ? "TEACHER" : "STUDENT";

  return (
    <AuthShell
      panelTitle={`You're joining ${org.name}.`}
      panelText="Your timetable, notices, attendance, and more — all in one place, the moment you sign in."
    >
      <JoinForm code={code} orgName={org.name} role={role} />
    </AuthShell>
  );
}
