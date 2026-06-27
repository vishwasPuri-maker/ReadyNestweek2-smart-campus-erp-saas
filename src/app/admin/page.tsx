import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tenantDb } from "@/lib/tenant";
import { genJoinCode, defaultCodeExpiry } from "@/lib/codes";
import { Role } from "@/generated/prisma/client";
import { Reveal } from "@/components/landing/reveal";
import { CountUp } from "@/components/app/count-up";
import { AddPersonPanel } from "@/components/app/add-person-panel";
import { InviteLinks } from "@/components/app/invite-links";
import { cn } from "@/lib/utils";

const CAPABILITIES = [
  {
    title: "Add & invite people",
    desc: "Create teacher and student accounts with a name, email, role, and a temporary password to share. They can sign in immediately.",
  },
  {
    title: "Manage roles & access",
    desc: "Switch someone between teacher and student, or deactivate and reactivate accounts. Admin accounts stay protected.",
  },
  {
    title: "Organization settings",
    desc: "Update your college's name and logo anytime from Settings.",
  },
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-vermillion/10 text-vermillion-ink",
  TEACHER: "bg-ink text-white",
  STUDENT: "bg-muted text-ink",
};

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
const titleCase = (r: string) => r.charAt(0) + r.slice(1).toLowerCase();

export default async function AdminOverview() {
  const session = await auth();
  const orgId = session!.user.organizationId;
  const db = tenantDb(orgId);

  const [total, teachers, students, inactive, recent] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: Role.TEACHER } }),
    db.user.count({ where: { role: Role.STUDENT } }),
    db.user.count({ where: { isActive: false } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    }),
  ]);

  const firstName = (session!.user.name ?? "Admin").split(" ")[0];
  const firstRun = teachers + students === 0;

  // Shareable join codes — lazily generated on first view, default 30-day expiry.
  const CODE_SELECT = {
    teacherCode: true,
    teacherCodeExpiresAt: true,
    teacherCodeMaxUses: true,
    teacherCodeUses: true,
    studentCode: true,
    studentCodeExpiresAt: true,
    studentCodeMaxUses: true,
    studentCodeUses: true,
  } as const;
  let org = await prisma.organization.findUnique({ where: { id: orgId }, select: CODE_SELECT });
  if (!org?.teacherCode || !org?.studentCode) {
    const in30 = defaultCodeExpiry();
    org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(org?.teacherCode ? {} : { teacherCode: genJoinCode(), teacherCodeExpiresAt: in30 }),
        ...(org?.studentCode ? {} : { studentCode: genJoinCode(), studentCodeExpiresAt: in30 }),
      },
      select: CODE_SELECT,
    });
  }
  const teacherInvite = {
    code: org!.teacherCode!,
    expiresAt: org!.teacherCodeExpiresAt?.toISOString() ?? null,
    maxUses: org!.teacherCodeMaxUses,
    uses: org!.teacherCodeUses,
  };
  const studentInvite = {
    code: org!.studentCode!,
    expiresAt: org!.studentCodeExpiresAt?.toISOString() ?? null,
    maxUses: org!.studentCodeMaxUses,
    uses: org!.studentCodeUses,
  };

  return (
    <>
      {/* Hero — the single signature moment. Hierarchy and weight do the work. */}
      <section className="relative">
        <div
          aria-hidden
          className="grid-lines pointer-events-none absolute -inset-x-8 -top-20 h-72 opacity-60 [mask-image:radial-gradient(60%_100%_at_0%_0%,#000,transparent_72%)]"
        />
        <div className="relative">
          <Reveal as="p" className="font-mono text-caption uppercase tracking-[0.22em] text-faint">
            Today
          </Reveal>
          <Reveal
            as="h1"
            delay={60}
            className="mt-4 font-display text-subheading font-semibold tracking-tight text-body"
          >
            Welcome back, {firstName}.
          </Reveal>

          <Reveal
            as="p"
            delay={120}
            className="mt-3 max-w-3xl font-display text-heading font-extrabold leading-[1.08] tracking-[-0.03em] text-ink text-balance sm:text-heading-lg"
          >
            <span className="font-medium text-faint">Your college runs on </span>
            <CountUp value={total} className="tabular-nums text-vermillion-ink" />{" "}
            {total === 1 ? "person" : "people"}
            <span className="font-medium text-faint"> — </span>
            <CountUp value={teachers} className="tabular-nums" />{" "}
            {teachers === 1 ? "teacher" : "teachers"}
            <span className="font-medium text-faint"> and </span>
            <CountUp value={students} className="tabular-nums" />{" "}
            {students === 1 ? "student" : "students"}.
            {inactive > 0 && (
              <span className="font-medium text-faint"> {inactive} inactive.</span>
            )}
          </Reveal>

          <Reveal
            delay={200}
            className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3"
          >
            <a
              href="#add"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
            >
              <Plus className="size-4" />
              Add person
            </a>
            {firstRun && (
              <span className="text-[14px] text-body">
                Add your first teacher or student to get going.
              </span>
            )}
          </Reveal>
        </div>
      </section>

      {/* What you can do — editorial capability list (no card grid) */}
      <section className="mt-20">
        <h2 className="font-mono text-caption uppercase tracking-[0.22em] text-faint">
          What you can do
        </h2>
        <ul className="mt-5 border-t border-line">
          {CAPABILITIES.map((c) => (
            <li
              key={c.title}
              className="flex flex-col gap-1.5 border-b border-line py-5 sm:flex-row sm:items-baseline sm:gap-10"
            >
              <p className="font-display text-subheading font-bold tracking-tight text-ink sm:w-60 sm:shrink-0">
                {c.title}
              </p>
              <p className="max-w-xl text-[14.5px] leading-relaxed text-body text-pretty">
                {c.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Add a teacher or student — two ways: a shareable link, or one-by-one */}
      <section id="add" className="mt-20 scroll-mt-24">
        <h2 className="font-mono text-caption uppercase tracking-[0.22em] text-faint">
          Add a teacher or student
        </h2>

        <div className="mt-6 space-y-9">
          <div>
            <h3 className="font-display text-subheading font-bold tracking-tight text-ink">
              Share a join link
            </h3>
            <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-body text-pretty">
              Send the link to a class group — people sign up themselves and land in
              the right role automatically. Regenerate a link anytime to revoke the
              old one.
            </p>
            <div className="mt-5">
              <InviteLinks teacher={teacherInvite} student={studentInvite} />
            </div>
          </div>

          <div className="border-t border-line pt-9">
            <h3 className="font-display text-subheading font-bold tracking-tight text-ink">
              Or add one by hand
            </h3>
            <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-body text-pretty">
              Create a single account with a temporary password and share the
              credentials — they can sign in right away.
            </p>
            <div className="mt-5">
              <AddPersonPanel />
            </div>
          </div>
        </div>
      </section>

      {/* Recently added — quieter, hover-reactive list (no entrance reflex here) */}
      <section className="mt-20">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-mono text-caption uppercase tracking-[0.22em] text-faint">
            Recently added
          </h2>
          <Link
            href="/admin/people"
            className="group inline-flex items-center gap-1 text-[13px] font-medium text-vermillion-ink hover:underline"
          >
            All people
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="border-t border-line py-12 text-[15px] text-faint">
            No people yet.
          </p>
        ) : (
          <ul className="border-t border-line">
            {recent.map((u) => (
              <li
                key={u.id}
                className="group -mx-3 flex items-center gap-4 border-b border-line px-3 py-3.5 transition-colors hover:bg-paper"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface font-mono text-[12px] font-semibold text-ink ring-1 ring-line transition-shadow group-hover:ring-vermillion/40">
                  {initials(u.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-ink">{u.name}</p>
                  <p className="truncate text-[13px] text-faint">{u.email}</p>
                </div>
                {!u.isActive && (
                  <span className="text-[12px] text-faint">Inactive</span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    ROLE_BADGE[u.role]
                  )}
                >
                  {titleCase(u.role)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
