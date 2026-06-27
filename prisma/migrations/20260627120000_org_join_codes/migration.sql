-- Shareable self-serve join codes per role (nullable; lazily generated; admin-regenerable).
ALTER TABLE "Organization" ADD COLUMN "teacherCode" TEXT;
ALTER TABLE "Organization" ADD COLUMN "studentCode" TEXT;

CREATE UNIQUE INDEX "Organization_teacherCode_key" ON "Organization"("teacherCode");
CREATE UNIQUE INDEX "Organization_studentCode_key" ON "Organization"("studentCode");
