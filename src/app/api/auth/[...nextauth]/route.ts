import { handlers } from "@/auth";

// Uses argon2 + Prisma → must run in the Node.js runtime, not edge.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
