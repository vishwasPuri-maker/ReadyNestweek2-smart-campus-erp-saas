import { route, parseJson, json, HttpError } from "@/lib/api";
import { requireUser, requireFound } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { parsePagination, paginated } from "@/lib/pagination";
import { createTaskSchema } from "@/lib/validations/resources";

export const runtime = "nodejs";

// GET /api/tasks
//   default → tasks I own (personal + assigned to me)
//   ?assigned=1 → tasks I assigned to others (teacher/admin tracking)
export const GET = route(async (req) => {
  const user = await requireUser();
  const { skip, take, page, limit } = parsePagination(req);
  const db = tenantDb(user.organizationId);
  const assignedView = new URL(req.url).searchParams.get("assigned") === "1";

  const where = assignedView ? { assignedById: user.id } : { ownerId: user.id };

  const [items, total] = await Promise.all([
    db.task.findMany({ where, orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }], skip, take }),
    db.task.count({ where }),
  ]);
  return json({ ok: true, ...paginated(items, total, page, limit) });
});

// POST /api/tasks — personal task (any role) or assignment (TEACHER/ADMIN → a user).
export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, createTaskSchema);
  const db = tenantDb(user.organizationId);

  // Teacher assigns to every student in their branch+section.
  if (input.assignToClass) {
    if (user.role === "STUDENT") throw new HttpError(403, "Students cannot assign tasks");
    const me = await db.user.findFirst({
      where: { id: user.id },
      select: { branch: true, section: true },
    });
    if (!me?.branch || !me?.section) throw new HttpError(400, "Set your class first");
    const students = await db.user.findMany({
      where: { role: "STUDENT", branch: me.branch, section: me.section, isActive: true },
      select: { id: true },
    });
    if (students.length === 0) throw new HttpError(400, "No students in your class yet");
    await db.task.createMany({
      data: students.map((s) => ({
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        ownerId: s.id,
        assignedById: user.id,
        organizationId: user.organizationId,
        attachment: input.attachment ?? undefined,
      })),
    });
    return json({ ok: true, count: students.length }, 201);
  }

  let ownerId = user.id;
  let assignedById: string | null = null;

  if (input.ownerId && input.ownerId !== user.id) {
    if (user.role === "STUDENT") throw new HttpError(403, "Students cannot assign tasks to others");
    // Assignee must exist in the same org.
    requireFound(await db.user.findFirst({ where: { id: input.ownerId }, select: { id: true } }));
    ownerId = input.ownerId;
    assignedById = user.id;
  }

  const created = await db.task.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      ownerId,
      assignedById,
      organizationId: user.organizationId,
      attachment: input.attachment ?? undefined,
    },
  });
  return json({ ok: true, task: created }, 201);
});
