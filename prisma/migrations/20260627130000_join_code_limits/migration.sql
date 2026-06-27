-- Per-role join code limits: expiry + usage cap + usage counter.
ALTER TABLE "Organization" ADD COLUMN "teacherCodeExpiresAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "teacherCodeMaxUses" INTEGER;
ALTER TABLE "Organization" ADD COLUMN "teacherCodeUses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Organization" ADD COLUMN "studentCodeExpiresAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "studentCodeMaxUses" INTEGER;
ALTER TABLE "Organization" ADD COLUMN "studentCodeUses" INTEGER NOT NULL DEFAULT 0;
