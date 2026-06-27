// Lightweight, structured audit logging for security-relevant actions. Emits one
// JSON line per event to stdout, which hosting platforms (Vercel/etc.) capture and
// make searchable. Never include secrets/passwords/tokens in the metadata.
//
// Kept dependency-free and side-effect-light so it can be called from any route.

type AuditEvent = {
  action: string; // e.g. "user.create", "auth.login", "notice.delete"
  actorId?: string | null; // who did it (user id), if known
  organizationId?: string | null; // tenant scope
  targetId?: string | null; // affected resource/user id
  outcome?: "success" | "failure";
  meta?: Record<string, string | number | boolean | null>;
};

export function audit(event: AuditEvent): void {
  const line = {
    type: "audit",
    ts: new Date().toISOString(),
    outcome: "success",
    ...event,
  };
  // Single JSON line → easy to grep/ingest.
  console.log(JSON.stringify(line));
}
