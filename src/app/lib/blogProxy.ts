import { NextResponse } from "next/server";
import { BLOG_API_BASE } from "./blogApi";
import { requireAdmin } from "./adminAuth";

export async function proxyBlogRequest(request: Request, path = "") {
  const method = request.method;
  const query = new URL(request.url).searchParams;
  if (method !== "GET" || !path && query.get("status") !== "published") {
    const denied = await requireAdmin(request);
    if (denied) return denied;
  }
  const headers = new Headers({ Accept: "application/json" });
  const token = request.headers.get("authorization");
  if (token) headers.set("Authorization", token);
  try {
    let body: string | undefined;
    if (!["GET", "HEAD"].includes(method)) {
      if (Number(request.headers.get("content-length")) > 350 * 1024) return NextResponse.json({ error: "This article is too large." }, { status: 413 });
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = []; let size = 0;
      if (reader) for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 350 * 1024) { await reader.cancel(); return NextResponse.json({ error: "This article is too large." }, { status: 413 }); }
        chunks.push(value);
      }
      if (size) body = Buffer.concat(chunks).toString("utf8");
      headers.set("Content-Type", "application/json");
    }
    const allowed = new URLSearchParams();
    for (const key of ["status", "category", "search", "page", "limit"]) if (query.has(key)) allowed.set(key, query.get(key)!);
    const upstream = await fetch(`${BLOG_API_BASE}${path}${allowed.size ? `?${allowed}` : ""}`, { method, headers, body, cache: "no-store", signal: AbortSignal.timeout(20000) });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, error: "Articles are temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
}
