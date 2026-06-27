import { auth } from "@/auth";
import { tenantDb } from "@/lib/tenant";
import { PeopleClient } from "./people-client";

export default async function PeoplePage() {
  const session = await auth();
  const db = tenantDb(session!.user.organizationId);

  const rows = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const users = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "ADMIN" | "TEACHER" | "STUDENT",
    isActive: u.isActive,
    verified: !!u.emailVerified,
    createdAt: u.createdAt.toISOString(),
  }));

  return <PeopleClient users={users} selfId={session!.user.id} />;
}
