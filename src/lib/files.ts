export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME = new Set<string>([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const ACCEPT_ATTR = ".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,image/*,application/pdf";

export function isAllowedType(t: string): boolean {
  return ALLOWED_MIME.has(t);
}

export function isImage(t: string): boolean {
  return t.startsWith("image/");
}

export function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type AttachmentMeta = { id: string; name: string; type: string; size: number };

/** Upload a file to /api/files; returns its attachment metadata. Client-only. */
export async function uploadFile(file: File): Promise<AttachmentMeta> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/files", { method: "POST", body: fd });
  const d = await res.json().catch(() => null);
  if (!res.ok) throw new Error(d?.message ?? "Upload failed");
  return { id: d.id, name: d.name, type: d.type, size: d.size };
}
