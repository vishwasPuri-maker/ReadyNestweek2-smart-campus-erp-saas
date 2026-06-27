import { randomUUID } from "node:crypto";

// Long, unguessable join code — it's the trust boundary for self-serve joining.
export function genJoinCode(): string {
  return randomUUID().replace(/-/g, "");
}

// Default expiry for a freshly generated join code (30 days out).
export function defaultCodeExpiry(): Date {
  return new Date(Date.now() + 30 * 86_400_000);
}
