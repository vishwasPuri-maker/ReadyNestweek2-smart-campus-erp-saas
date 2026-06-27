import { requireUser } from "@/lib/authorize";
import { tenantDb } from "@/lib/tenant";
import { HttpError } from "@/lib/api";

export const runtime = "nodejs";

// GET /api/files/[id] — stream a file (org-scoped). ?download=1 forces a download;
// otherwise it's served inline (images/PDFs render in the browser).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const db = tenantDb(user.organizationId);

    const file = await db.fileBlob.findFirst({
      where: { id },
      select: { name: true, mimeType: true, size: true, data: true },
    });
    if (!file) return new Response("Not found", { status: 404 });

    const download = new URL(req.url).searchParams.get("download") === "1";
    const safeName = encodeURIComponent(file.name);

    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.size),
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${safeName}`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return new Response(err.message, { status: err.status });
    }
    return new Response("Something went wrong", { status: 500 });
  }
}
