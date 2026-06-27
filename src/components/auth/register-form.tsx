"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { registerSchema } from "@/lib/validations/auth";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

type Errors = Partial<Record<"organizationName" | "name" | "email" | "password", string>>;

export function RegisterForm() {
  const [values, setValues] = React.useState({
    organizationName: "",
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  // resend
  const [resending, setResending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
    setFormError(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 429) {
        setFormError("Too many attempts. Please try again in a moment.");
        return;
      }
      if (!res.ok) {
        setFormError("Something went wrong. Please try again.");
        return;
      }
      setSentTo(parsed.data.email);
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!sentTo || resending || cooldown > 0) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sentTo }),
      });
      setCooldown(30);
    } catch {
      /* generic — silently allow retry */
    } finally {
      setResending(false);
    }
  }

  // ---- Check-your-email state ----
  if (sentTo) {
    return (
      <div>
        <span className="grid size-12 place-items-center rounded-xl border border-line bg-surface text-vermillion shadow-soft">
          <MailCheck className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-[28px] font-bold tracking-tight text-ink">
          Check your email
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          If <span className="font-medium text-ink">{sentTo}</span> is available, we
          just sent it a verification link. Click it to activate your college, then
          sign in.
        </p>
        <p className="mt-2 text-[13px] text-faint">
          Can&apos;t find it? Check your spam folder, or resend below.
        </p>

        <div className="mt-7 flex items-center gap-3">
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldown > 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-5 text-[14px] font-semibold text-ink transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending && <Loader2 className="size-4 animate-spin" />}
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
          </button>
          <Link
            href="/login"
            className="text-[14px] font-medium text-vermillion-ink hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ---- Form state ----
  return (
    <div>
      <h1 className="font-display text-[28px] font-bold tracking-tight text-ink">
        Create your college
      </h1>
      <p className="mt-2 text-[15px] text-body">
        Set up your workspace in a minute — you&apos;ll be the admin.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Field id="organizationName" label="Organization name" error={errors.organizationName}>
          <Input
            id="organizationName"
            name="organizationName"
            autoComplete="organization"
            placeholder="Demo College"
            value={values.organizationName}
            onChange={set("organizationName")}
            aria-invalid={!!errors.organizationName}
            disabled={submitting}
          />
        </Field>

        <Field id="name" label="Your name" error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="A. Rao"
            value={values.name}
            onChange={set("name")}
            aria-invalid={!!errors.name}
            disabled={submitting}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={values.email}
            onChange={set("email")}
            aria-invalid={!!errors.email}
            disabled={submitting}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          error={errors.password}
          hint="At least 8 characters."
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password}
            onChange={set("password")}
            aria-invalid={!!errors.password}
            disabled={submitting}
          />
        </Field>

        {formError && (
          <p className="text-[13px] font-medium text-vermillion-ink" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-vermillion text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              Register your college
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-body">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-vermillion-ink hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
