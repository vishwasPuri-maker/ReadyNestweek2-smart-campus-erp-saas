"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

export function JoinForm({
  code,
  orgName,
  role,
}: {
  code: string;
  orgName: string;
  role: "TEACHER" | "STUDENT";
}) {
  const router = useRouter();
  const [values, setValues] = React.useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = React.useState<Errors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
    setFormError(null);
  };

  function validate() {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
    if (values.password.length < 8) next.password = "At least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...values, email: values.email.trim().toLowerCase() }),
      });
      if (res.status === 409) {
        setErrors((p) => ({ ...p, email: "That email is already in use." }));
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setFormError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }
      // Account is active — sign them straight in.
      const signin = await signIn("credentials", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        redirect: false,
      });
      if (signin?.error) {
        router.push("/login?joined=1");
        return;
      }
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
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-vermillion-ink">
        Join as {role === "TEACHER" ? "a teacher" : "a student"}
      </p>
      <h1 className="mt-3 font-display text-[28px] font-bold tracking-tight text-ink text-balance">
        Join {orgName}
      </h1>
      <p className="mt-2 text-[15px] text-body">
        Create your account — you&apos;ll be signed in right away.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Field id="name" label="Your name" error={errors.name}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Diya Mehta"
            value={values.name}
            onChange={set("name")}
            aria-invalid={!!errors.name}
            disabled={submitting}
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            value={values.email}
            onChange={set("email")}
            aria-invalid={!!errors.email}
            disabled={submitting}
          />
        </Field>
        <Field id="password" label="Password" error={errors.password} hint="At least 8 characters.">
          <PasswordInput
            id="password"
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
              Joining…
            </>
          ) : (
            <>
              Join {orgName}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-body">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-vermillion-ink hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}
