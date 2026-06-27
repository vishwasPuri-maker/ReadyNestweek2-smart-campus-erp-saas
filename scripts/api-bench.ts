import "dotenv/config";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const PW = "Admin@123";

type Jar = Map<string, string>;
const ch = (j: Jar) => [...j.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
function store(j: Jar, r: Response) {
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const [p] = c.split(";"); const i = p.indexOf("="); j.set(p.slice(0, i), p.slice(i + 1));
  }
}
async function jf(j: Jar, path: string, init?: RequestInit) {
  const r = await fetch(`${BASE}${path}`, { ...init, headers: { ...(init?.headers ?? {}), cookie: ch(j) }, redirect: "manual" });
  store(j, r); return r;
}
async function login(email: string, password: string): Promise<Jar> {
  const j: Jar = new Map();
  const { csrfToken } = await (await jf(j, "/api/auth/csrf")).json();
  await jf(j, "/api/auth/callback/credentials", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ csrfToken, email, password }).toString() });
  return j;
}

async function time(jar: Jar, path: string, n = 10) {
  await jf(jar, path); // warmup (dev compiles route on first hit)
  const ts: number[] = [];
  for (let i = 0; i < n; i++) {
    const s = performance.now();
    await jf(jar, path);
    ts.push(performance.now() - s);
  }
  ts.sort((a, b) => a - b);
  const avg = ts.reduce((a, b) => a + b, 0) / n;
  const p50 = ts[Math.floor(n / 2)];
  return { avg, p50, min: ts[0], max: ts[n - 1] };
}

async function main() {
  const admin = await login("admin@demo.edu", PW);
  const endpoints = ["/api/profile", "/api/organizations", "/api/notices", "/api/notes", "/api/users", "/api/timetable", "/api/attendance"];
  console.log(`Target: ${BASE}  (DB: Neon ap-southeast-1)\n`);
  console.log("endpoint".padEnd(22), "avg".padStart(8), "p50".padStart(8), "min".padStart(8), "max".padStart(8));
  for (const ep of endpoints) {
    const r = await time(admin, ep);
    const ms = (x: number) => `${x.toFixed(0)}ms`.padStart(8);
    console.log(ep.padEnd(22), ms(r.avg), ms(r.p50), ms(r.min), ms(r.max));
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
