import { route, parseJson, json } from "@/lib/api";
import { requireUser, requireRole } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { parsePagination, paginated } from "@/lib/pagination";
import { createNoticeSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// GET /api/notices — scoped: ADMIN sees all; TEACHER/STUDENT see org-wide notices
// (branch null) + notices for their own branch+section.
export const GET = route(async (req) => {
  const user = await requireUser();
  const { skip, take, page, limit } = parsePagination(req);
  const db = tenantDb(user.organizationId);

  let where: Record<string, unknown> = {};
  if (user.role !== "ADMIN") {
    const me = await db.user.findFirst({
      where: { id: user.id },
      select: { branch: true, section: true },
    });
    where = {
      OR: [
        { branch: null },
        ...(me?.branch && me?.section
          ? [{ branch: me.branch, section: me.section }]
          : []),
      ],
    };
  }

  const [items, total] = await Promise.all([
    db.notice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        body: true,
        branch: true,
        section: true,
        createdAt: true,
        author: { select: { id: true, name: true, role: true } },
      },
    }),
    db.notice.count({ where }),
  ]);
  return json({ ok: true, ...paginated(items, total, page, limit) });
});

// POST /api/notices — ADMIN posts org-wide; TEACHER posts to their own class.
export const POST = route(async (req) => {
  const user = await requireRole("ADMIN", "TEACHER");
  const input = await parseJson(req, createNoticeSchema);
  const db = tenantDb(user.organizationId);

  let branch: string | null = null;
  let section: string | null = null;
  if (user.role === "TEACHER") {
    const me = await db.user.findFirst({
      where: { id: user.id },
      select: { branch: true, section: true },
    });
    branch = me?.branch ?? null;
    section = me?.section ?? null;
  }

  const created = await db.notice.create({
    data: {
      title: input.title,
      body: input.body,
      authorId: user.id,
      organizationId: user.organizationId,
      branch,
      section,
      attachment: input.attachment ?? undefined,
    },
    select: { id: true, title: true, body: true, createdAt: true },
  });
  return json({ ok: true, notice: created }, 201);
});
