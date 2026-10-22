import { NextResponse } from "next/server";

export async function isAdminRequest(request: Request): Promise<boolean> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const backend = process.env.NEXT_PUBLIC_API_BASE;
  if (!token || !backend) return false;
  try {
    const response = await fetch(`${backend.replace(/\/$/, "")}/api/auth/admin/session`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    return response.ok;
  } catch { return false; }
}

export async function requireAdmin(request: Request) {
  if (await isAdminRequest(request)) return null;
  return NextResponse.json({ success: false, error: "Administrator sign in required." }, { status: 401 });
}
