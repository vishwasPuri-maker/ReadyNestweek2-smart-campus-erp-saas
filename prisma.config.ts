import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 config. The CLI (migrate / introspect) uses this datasource URL.
// Use the UNPOOLED direct connection for migrations (DIRECT_URL); fall back to
// DATABASE_URL for local single-connection setups.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
