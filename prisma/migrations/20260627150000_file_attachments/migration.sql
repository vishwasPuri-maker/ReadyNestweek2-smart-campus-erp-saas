-- File storage in Postgres + attachment metadata on tasks, notices, notes.
CREATE TABLE "FileBlob" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FileBlob_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FileBlob_organizationId_idx" ON "FileBlob"("organizationId");
ALTER TABLE "FileBlob" ADD CONSTRAINT "FileBlob_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD COLUMN "attachment" JSONB;
ALTER TABLE "Notice" ADD COLUMN "attachment" JSONB;
ALTER TABLE "Note" ADD COLUMN "attachment" JSONB;
ALTER TABLE "Note" ALTER COLUMN "content" SET DEFAULT '';
