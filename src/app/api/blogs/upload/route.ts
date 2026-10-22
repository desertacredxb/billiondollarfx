import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/adminAuth";
import { BLOG_API_BASE } from "@/app/lib/blogApi";

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (Number(request.headers.get("content-length")) > 5 * 1024 * 1024 + 10000) return NextResponse.json({ error: "Choose an image up to 5 MB." }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return NextResponse.json({ error: "Choose a JPEG, PNG, WebP or GIF image up to 5 MB." }, { status: 400 });
    const body = new FormData(); body.set("file", file);
    const response = await fetch(`${BLOG_API_BASE}/upload`, { method: "POST", headers: { Authorization: request.headers.get("authorization")! }, body, cache: "no-store", signal: AbortSignal.timeout(30000) });
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unable to upload this image. Please try again." }, { status: 503 }); }
}
