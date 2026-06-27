"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Plus } from "lucide-react";
import { createUserSchema } from "@/lib/validations/resources";
import { Field } from "@/components/auth/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PasswordInput } from "@/components/auth/password-input";

type AddErrors = Partial<Record<"name" | "email" | "role" | "password", string>>;

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

export function AddPersonForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [values, setValues] = React.useState({
    name: "",
    email: "",
    role: "TEACHER" as "TEACHER" | "STUDENT",
    password: "",
  });
  const [errors, setErrors] = React.useState<AddErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [created, setCreated] = React.useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const setField = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
    setFormError(null);
  };

  function resetForm() {
    setValues({ name: "", email: "", role: "TEACHER", password: "" });
    setErrors({});
    setFormError(null);
    setCreated(null);
    setCopied(false);
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = createUserSchema.safeParse(values);
    if (!parsed.success) {
      const next: AddErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof AddErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.status === 409) {
        setErrors((p) => ({ ...p, email: "That email is already in use." }));
        return;
      }
      if (!res.ok) {
        setFormError("Something went wrong. Please try again.");
        return;
      }
      setCreated({ email: parsed.data.email, password: parsed.data.password });
      router.refresh();
    } catch {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  async function copyCreds() {
    if (!created) return;
    await navigator.clipboard.writeText(
      `Email: ${created.email}\nPassword: ${created.password}`
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (created) {
    return (
      <div>
        <p className="text-[14px] text-body">
          Share these sign-in details with the new member — there&apos;s no invite
          email.
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3">
          <div className="font-mono text-[13px] text-ink">
            <div>{created.email}</div>
            <div>{created.password}</div>
          </div>
          <button
            type="button"
            onClick={copyCreds}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-[14px] font-semibold text-white transition-colors hover:bg-graphite"
          >
            <Plus className="size-4" />
            Add another
          </button>
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex h-10 items-center rounded-lg border border-line bg-surface px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-muted"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitAdd} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field id="name" label="Full name" error={errors.name}>
        <Input id="name" value={values.name} onChange={setField("name")} placeholder="Diya Mehta" aria-invalid={!!errors.name} disabled={adding} />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <Input id="email" type="email" value={values.email} onChange={setField("email")} placeholder="diya@college.edu" aria-invalid={!!errors.email} disabled={adding} />
      </Field>
      <Field id="role" label="Role" error={errors.role}>
        <Select id="role" value={values.role} onChange={setField("role")} disabled={adding}>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </Select>
      </Field>
      <Field id="password" label="Temporary password" error={errors.password} hint="At least 8 characters — share it with the member.">
        <div className="flex gap-2">
          <PasswordInput id="password" value={values.password} onChange={setField("password")} placeholder="••••••••" aria-invalid={!!errors.password} disabled={adding} />
          <button
            type="button"
            onClick={() => {
              setValues((v) => ({ ...v, password: genPassword() }));
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            className="h-11 shrink-0 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-muted"
          >
            Generate
          </button>
        </div>
      </Field>

      <div className="sm:col-span-2">
        {formError && (
          <p className="mb-3 text-[13px] font-medium text-vermillion-ink" role="alert">
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={adding}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion disabled:pointer-events-none disabled:opacity-60"
        >
          {adding && <Loader2 className="size-4 animate-spin" />}
          Create account
        </button>
      </div>
    </form>
  );
}
