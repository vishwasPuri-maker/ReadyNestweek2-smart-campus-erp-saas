import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const org = await prisma.organization.findUnique({
    where: { id: session!.user.organizationId },
    select: { name: true, logoUrl: true, slug: true },
  });

  return (
    <SettingsForm
      initialName={org?.name ?? ""}
      initialLogoUrl={org?.logoUrl ?? ""}
      slug={org?.slug ?? ""}
    />
  );
}
