import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { toErrorResponse } from "@/lib/api";
import { MAX_FILE_BYTES, isAllowedType } from "@/lib/files";

export const runtime = "nodejs";

// POST /api/files — upload one file (multipart). Stored in Postgres, org-scoped.
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "No file provided" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ ok: false, message: "The file is empty" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: false, message: "File too large — max 10 MB" }, { status: 413 });
    }
    if (!isAllowedType(file.type)) {
      return NextResponse.json(
        { ok: false, message: "Unsupported type — use an image, PDF, or Word document" },
        { status: 415 }
      );
    }

    const name = file.name.slice(0, 255) || "file";
    const data = Buffer.from(await file.arrayBuffer());

    const db = tenantDb(user.organizationId);
    const created = await db.fileBlob.create({
      data: {
        name,
        mimeType: file.type,
        size: file.size,
        data,
        createdById: user.id,
        organizationId: user.organizationId,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id, name, type: file.type, size: file.size });
  } catch (err) {
    return toErrorResponse(err);
  }
}
