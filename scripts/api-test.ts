import "dotenv/config";
import * as argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
}

// --- minimal cookie jar over fetch ---
type Jar = Map<string, string>;
function cookieHeader(jar: Jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function storeCookies(jar: Jar, res: Response) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    jar.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}
async function jfetch(jar: Jar, path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), cookie: cookieHeader(jar) },
    redirect: "manual",
  });
  storeCookies(jar, res);
  return res;
}

async function login(email: string, password: string): Promise<Jar> {
  const jar: Jar = new Map();
  const csrfRes = await jfetch(jar, "/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();
  await jfetch(jar, "/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, email, password }).toString(),
  });
  if (!jar.has("authjs.session-token")) throw new Error(`login failed for ${email}`);
  return jar;
}

async function ensureOrg(slug: string, name: string, pw: string) {
  const org = await prisma.organization.upsert({
    where: { slug }, update: {}, create: { name, slug, verified: true },
  });
  const hash = await argon2.hash(pw, { type: argon2.argon2id });
  for (const role of ["ADMIN", "TEACHER", "STUDENT"] as const) {
    const email = `${role.toLowerCase()}@${slug}.edu`;
    await prisma.user.upsert({
      where: { email }, update: {},
      create: { organizationId: org.id, email, name: `${name} ${role}`, role, passwordHash: hash, emailVerified: new Date() },
    });
  }
  return org;
}

async function main() {
  const PW = "Passw0rd!";
  // Org A = seeded Demo College (reset its passwords to PW for predictability)
  const demo = await prisma.organization.findUniqueOrThrow({ where: { slug: "demo-college" } });
  const hash = await argon2.hash(PW, { type: argon2.argon2id });
  await prisma.user.updateMany({ where: { organizationId: demo.id }, data: { passwordHash: hash } });
  // Org B
  await ensureOrg("beta-college", "Beta College", PW);

  const adminA = await login("admin@demo.edu", PW);
  const teacherA = await login("teacher@demo.edu", PW);
  const studentA = await login("student@demo.edu", PW);
  const adminB = await login("admin@beta-college.edu", PW);

  const studentAId = (await prisma.user.findUniqueOrThrow({ where: { email: "student@demo.edu" }, select: { id: true } })).id;

  console.log("\n# Role escalation (STUDENT blocked from teacher/admin actions)");
  check("student → POST /api/notices = 403", (await jfetch(studentA, "/api/notices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "x", body: "y" }) })).status === 403);
  check("student → GET /api/users = 403", (await jfetch(studentA, "/api/users")).status === 403);
  check("student → POST /api/attendance = 403", (await jfetch(studentA, "/api/attendance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ studentId: studentAId, date: "2026-06-26", present: true, subject: "Math" }) })).status === 403);

  console.log("\n# Allowed actions");
  const noticeRes = await jfetch(teacherA, "/api/notices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "A-only notice", body: "secret" }) });
  check("teacher → POST /api/notices = 201", noticeRes.status === 201);
  const noticeId = (await noticeRes.json()).notice?.id;
  check("student → GET /api/notices = 200", (await jfetch(studentA, "/api/notices")).status === 200);
  check("admin → GET /api/users = 200", (await jfetch(adminA, "/api/users")).status === 200);

  console.log("\n# Cross-tenant isolation (Org B cannot see/touch Org A's notice)");
  const bNotices = await (await jfetch(adminB, "/api/notices")).json();
  check("Org B notices list excludes Org A's notice", !bNotices.items?.some((n: { id: string }) => n.id === noticeId), JSON.stringify(bNotices.items?.map((n: {id:string})=>n.id)));
  check("Org B → PATCH Org A notice = 404", (await jfetch(adminB, `/api/notices/${noticeId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "hacked" }) })).status === 404);
  check("Org B → DELETE Org A notice = 404", (await jfetch(adminB, `/api/notices/${noticeId}`, { method: "DELETE" })).status === 404);

  console.log("\n# IDOR (note owned by student A not reachable by others)");
  const noteRes = await jfetch(studentA, "/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "diary", content: "private" }) });
  const noteId = (await noteRes.json()).note?.id;
  check("owner → GET own note = 200", (await jfetch(studentA, `/api/notes/${noteId}`)).status === 200);
  check("teacher A → GET student A's note = 404", (await jfetch(teacherA, `/api/notes/${noteId}`)).status === 404);
  check("admin B → GET student A's note = 404", (await jfetch(adminB, `/api/notes/${noteId}`)).status === 404);
  check("teacher A → DELETE student A's note = 404", (await jfetch(teacherA, `/api/notes/${noteId}`, { method: "DELETE" })).status === 404);

  console.log("\n# Unauthenticated");
  const anon: Jar = new Map();
  check("anon → GET /api/notices = 401", (await jfetch(anon, "/api/notices")).status === 401);

  // cleanup: delete the test notice/note + Org B
  await prisma.organization.deleteMany({ where: { slug: "beta-college" } });
  if (noticeId) await prisma.notice.deleteMany({ where: { id: noticeId } });
  if (noteId) await prisma.note.deleteMany({ where: { id: noteId } });

  console.log(`\n=== ${pass} passed, ${fail} failed ===`);
  await prisma.$disconnect();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
