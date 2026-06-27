"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Field } from "@/components/auth/field";
import { Input } from "@/components/ui/input";

export function SettingsForm({
  initialName,
  initialLogoUrl,
  slug,
}: {
  initialName: string;
  initialLogoUrl: string;
  slug: string;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initialName);
  const [logoUrl, setLogoUrl] = React.useState(initialLogoUrl);
  const [errors, setErrors] = React.useState<{ name?: string; logoUrl?: string }>({});
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const dirty = name !== initialName || logoUrl !== initialLogoUrl;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaved(false);

    if (name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters." });
      return;
    }
    const cleanLogo = logoUrl.trim();
    if (cleanLogo && !/^https?:\/\/.+/i.test(cleanLogo)) {
      setErrors({ logoUrl: "Enter a valid URL (https://…)." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logoUrl: cleanLogo || null }),
      });
      if (!res.ok) {
        setErrors({ name: "Couldn't save. Please try again." });
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setErrors({ name: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Your organization details." />

      <form onSubmit={onSubmit} className="max-w-lg space-y-6 border-t border-line pt-8">
        <Field id="name" label="Organization name" error={errors.name}>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            aria-invalid={!!errors.name}
            disabled={saving}
          />
        </Field>

        <Field
          id="logoUrl"
          label="Logo URL"
          error={errors.logoUrl}
          hint="Optional — a link to your logo image."
        >
          <Input
            id="logoUrl"
            value={logoUrl}
            onChange={(e) => {
              setLogoUrl(e.target.value);
              setSaved(false);
            }}
            placeholder="https://…"
            aria-invalid={!!errors.logoUrl}
            disabled={saving}
          />
        </Field>

        <div>
          <p className="text-[13px] font-medium text-ink">Workspace URL</p>
          <p className="mt-1 font-mono text-[13px] text-faint">
            {slug}.smartcampus.app
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion disabled:pointer-events-none disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-body">
              <Check className="size-4 text-vermillion-ink" />
              Saved
            </span>
          )}
        </div>
      </form>
    </>
  );
}
