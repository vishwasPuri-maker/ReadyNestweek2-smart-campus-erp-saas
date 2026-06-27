"use client";

import { useState } from "react";
import {
  KeyRound,
  ListChecks,
  ScrollText,
  ShieldCheck,
  Timer,
  UserCheck,
  Zap,
} from "lucide-react";
import { Reveal } from "./reveal";
import RadialOrbitalTimeline, {
  type TimelineItem,
} from "@/components/ui/radial-orbital-timeline";

// Smart Campus's real, layered security model — the demo timeline data is replaced
// with our actual defense-in-depth layers. Each node links to the layers it works with.
const securityLayers: TimelineItem[] = [
  {
    id: 1,
    title: "Authentication",
    date: "Auth.js · JWT",
    content:
      "Stateless JWT sessions carry role and organization. Passwords are hashed with argon2id — never stored or logged in plaintext.",
    category: "Identity",
    icon: KeyRound,
    relatedIds: [2, 6],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Tenant Isolation",
    date: "organizationId",
    content:
      "Every query is automatically scoped to the organization on your verified token. One college can never read or detect another's data — cross-tenant access returns 404.",
    category: "Boundary",
    icon: ShieldCheck,
    relatedIds: [1, 3],
    status: "completed",
    energy: 100,
  },
  {
    id: 3,
    title: "Role-Based Access",
    date: "RBAC",
    content:
      "Authentication and role are verified on the server for every protected route, against a fixed role-to-permission model. Hidden UI is never the security boundary.",
    category: "Authorization",
    icon: UserCheck,
    relatedIds: [2, 4],
    status: "completed",
    energy: 98,
  },
  {
    id: 4,
    title: "Input Validation",
    date: "Zod",
    content:
      "Every endpoint validates its input with a schema before anything runs. Malformed or hostile payloads are rejected with generic errors — no field-level leaks.",
    category: "Integrity",
    icon: ListChecks,
    relatedIds: [3, 5],
    status: "completed",
    energy: 95,
  },
  {
    id: 5,
    title: "Audit Logging",
    date: "Structured",
    content:
      "Sensitive actions — logins, user changes, org updates — are recorded in a structured audit trail, so every high-stakes change is accountable.",
    category: "Accountability",
    icon: ScrollText,
    relatedIds: [4, 6],
    status: "completed",
    energy: 90,
  },
  {
    id: 6,
    title: "Rate Limiting",
    date: "Upstash",
    content:
      "Auth and other sensitive endpoints are rate-limited per IP to blunt brute-force and enumeration attempts before they reach your data.",
    category: "Resilience",
    icon: Timer,
    relatedIds: [5, 1],
    status: "completed",
    energy: 85,
  },
];

function Callout({ active }: { active: TimelineItem | null }) {
  if (!active) {
    return (
      <p className="max-w-xs text-[14px] leading-relaxed text-white/55">
        Tap any layer in the map — a line will trace out to explain exactly how it
        keeps each college&apos;s data sealed off.
      </p>
    );
  }

  const Icon = active.icon;
  return (
    <div
      key={active.id}
      className="relative duration-500 animate-in fade-in slide-in-from-left-3"
    >
      {/* connecting line reaching back toward the node, with a node dot at the far end */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-2.5 hidden h-px w-[42vw] max-w-[440px] bg-gradient-to-l from-vermillion via-vermillion/50 to-transparent lg:block"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-2.5 hidden size-1.5 -translate-y-1/2 rounded-full bg-vermillion lg:block"
      />

      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-vermillion" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
          {active.category} · {active.date}
        </span>
      </div>

      <h3 className="mt-3 font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-bold leading-[1.05] tracking-tight text-white text-balance">
        {active.title}
      </h3>

      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
        {active.content}
      </p>

      <div className="mt-6 max-w-xs">
        <div className="mb-1.5 flex items-center justify-between text-[12px] text-white/55">
          <span className="flex items-center gap-1.5">
            <Zap className="size-3" /> Coverage
          </span>
          <span className="font-mono text-white/80">{active.energy}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vermillion to-vermillion-press transition-all duration-500"
            style={{ width: `${active.energy}%` }}
          />
        </div>
      </div>

      {active.relatedIds.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-white/40">
            Works with
          </span>
          {active.relatedIds.map((rid) => {
            const rel = securityLayers.find((l) => l.id === rid);
            if (!rel) return null;
            return (
              <span
                key={rid}
                className="inline-flex items-center gap-1.5 text-[12.5px] text-white/70"
              >
                <rel.icon className="size-3 text-white/45" />
                {rel.title}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Trust() {
  const [active, setActive] = useState<TimelineItem | null>(null);

  return (
    <section id="trust" className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-vermillion">
            Trust is a feature
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-balance">
            Security that assumes the worst request.
          </h2>
          <p className="mt-4 text-body-lg text-white/60 text-pretty">
            We build as if every endpoint will be hit directly with a student&apos;s
            token. Isolation and role boundaries are tested, not promised — six
            layers, working together.{" "}
            <span className="text-white/55">Tap a layer to explore it.</span>
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_minmax(300px,420px)]">
          <div className="relative h-[440px] sm:h-[560px]">
            <RadialOrbitalTimeline
              timelineData={securityLayers}
              onActiveChange={setActive}
              showCard={false}
            />
          </div>
          <div className="relative flex min-h-[160px] items-center lg:min-h-[560px]">
            <Callout active={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
