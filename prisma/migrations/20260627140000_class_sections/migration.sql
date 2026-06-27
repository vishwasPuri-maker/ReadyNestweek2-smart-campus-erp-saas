-- Class membership (branch + section) on users, plus scoping on notices & timetable.
ALTER TABLE "User" ADD COLUMN "branch" TEXT;
ALTER TABLE "User" ADD COLUMN "section" TEXT;

ALTER TABLE "Notice" ADD COLUMN "branch" TEXT;
ALTER TABLE "Notice" ADD COLUMN "section" TEXT;

ALTER TABLE "TimetableEntry" ADD COLUMN "branch" TEXT;
ALTER TABLE "TimetableEntry" ADD COLUMN "section" TEXT;

CREATE INDEX "User_organizationId_role_branch_section_idx" ON "User"("organizationId", "role", "branch", "section");
CREATE INDEX "Notice_organizationId_branch_section_idx" ON "Notice"("organizationId", "branch", "section");
CREATE INDEX "TimetableEntry_organizationId_branch_section_idx" ON "TimetableEntry"("organizationId", "branch", "section");
