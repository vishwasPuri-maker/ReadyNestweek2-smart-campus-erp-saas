"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Check, Loader2, TriangleAlert } from "lucide-react";
import { loginSchema } from "@/lib/validations/auth";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

type Errors = Partial<Record<"email" | "password", string>>;

export function LoginForm({
  verified = false,
  linkError = false,
  roleHint = null,
}: {
  verified?: boolean;
  linkError?: boolean;
  roleHint?: string | null;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState({ email: "", password: "" });
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
    setFormError(null);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !next[key]) next[key] = issue.message || "Required";
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (res?.error) {
        setFormError("Invalid email or password.");
        return;
      }
      // /dashboard routes to the role's workspace.
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {roleHint && (
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-vermillion-ink">
          {roleHint} sign-in
        </p>
      )}
      <h1 className="mt-2 font-display text-[28px] font-bold tracking-tight text-ink">
        Welcome back
      </h1>
      <p className="mt-2 text-[15px] text-body">
        Sign in to your college workspace.
      </p>

      {verified && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
          <p className="text-[13.5px] text-body">
            Email verified — you can sign in now.
          </p>
        </div>
      )}

      {linkError && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-vermillion/[0.06] px-3.5 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-vermillion-ink" />
          <p className="text-[13.5px] text-body">
            That verification link was invalid or expired. Register again to get a
            fresh one.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
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

        <Field id="password" label="Password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={set("password")}
            aria-invalid={!!errors.password}
            disabled={submitting}
          />
        </Field>

        {formError && (
          <div role="alert">
            <p className="text-[13px] font-medium text-vermillion-ink">{formError}</p>
            <p className="mt-1 text-[12px] text-faint">
              Just signed up? Verify your email from the link we sent first.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-vermillion text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-body">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-vermillion-ink hover:underline"
        >
          Register your college
        </Link>
      </p>
    </div>
  );
}
