import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Post-login lands here, then routes to the role's workspace.
export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin");
    case "TEACHER":
      redirect("/teacher");
    default:
      redirect("/student");
  }
}
