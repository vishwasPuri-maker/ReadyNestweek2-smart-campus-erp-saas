import "dotenv/config";
import * as argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Standalone client (CLI context, no Next alias). Uses the pooled DATABASE_URL.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const hash = (pw: string) => argon2.hash(pw, { type: argon2.argon2id });

async function main() {
  // Demo organization (idempotent on slug).
  const org = await prisma.organization.upsert({
    where: { slug: "demo-college" },
    update: {},
    create: { name: "Demo College", slug: "demo-college", verified: true },
  });

  const users = [
    { email: "admin@demo.edu", name: "Demo Admin", role: "ADMIN" as const, pw: "Admin@123" },
    { email: "teacher@demo.edu", name: "Demo Teacher", role: "TEACHER" as const, pw: "Teacher@123" },
    { email: "student@demo.edu", name: "Demo Student", role: "STUDENT" as const, pw: "Student@123" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        organizationId: org.id,
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: await hash(u.pw),
        emailVerified: new Date(),
      },
    });
  }

  console.log("Seeded org 'Demo College' with admin/teacher/student (password printed in users array).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
