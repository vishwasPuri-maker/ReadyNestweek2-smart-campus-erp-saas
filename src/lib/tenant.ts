import { prisma } from "@/lib/prisma";

// Models that carry organizationId and MUST always be scoped to a single tenant.
// Organization (the tenant itself) and VerificationToken (used pre-login) are excluded.
const TENANT_MODELS = new Set<string>([
  "User",
  "Notice",
  "TimetableEntry",
  "Attendance",
  "Task",
  "Note",
  "FileBlob",
]);

// Single-record-by-unique-id operations: their `where` is a unique selector, so we
// cannot safely append organizationId (it would be an invalid unique input on models
// whose @id is just `id`). These are blocked on tenant models — use the *Many /
// findFirst variants with an explicit { id, organizationId, [ownerId] } filter instead
// (see CRITICAL RULE #4). This keeps every tenant query provably scoped.
const BLOCKED_UNIQUE_OPS = new Set<string>([
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "delete",
]);

/**
 * Tenant-scoped Prisma client. organizationId comes ONLY from the verified session —
 * never from request input. Reads get `where.organizationId`, writes get
 * `data.organizationId`, automatically. Use this for every tenant-table query.
 *
 *   const db = tenantDb(session.user.organizationId);
 *   const notes = await db.note.findMany();          // auto-scoped
 *   const note  = await db.note.findFirst({ where: { id, ownerId } }); // + org
 */
export function tenantDb(organizationId: string) {
  if (!organizationId) {
    throw new Error("tenantDb requires an organizationId from the session");
  }

  return prisma.$extends({
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async $allOperations({ model, operation, args, query }: any) {
          if (!TENANT_MODELS.has(model)) {
            return query(args);
          }

          if (BLOCKED_UNIQUE_OPS.has(operation)) {
            throw new Error(
              `tenantDb: "${operation}" on tenant model "${model}" is not allowed. ` +
                `Use findFirst / updateMany / deleteMany with { id, organizationId } so the query stays tenant-scoped.`,
            );
          }

          switch (operation) {
            case "findMany":
            case "findFirst":
            case "findFirstOrThrow":
            case "count":
            case "aggregate":
            case "groupBy":
            case "updateMany":
            case "updateManyAndReturn":
            case "deleteMany":
              args.where = { ...(args.where ?? {}), organizationId };
              break;
            case "create":
              args.data = { ...(args.data ?? {}), organizationId };
              break;
            case "createMany":
            case "createManyAndReturn":
              args.data = Array.isArray(args.data)
                ? args.data.map((d: Record<string, unknown>) => ({ ...d, organizationId }))
                : { ...(args.data ?? {}), organizationId };
              break;
            case "upsert":
              args.where = { ...(args.where ?? {}), organizationId };
              args.create = { ...(args.create ?? {}), organizationId };
              break;
          }

          return query(args);
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof tenantDb>;
