import { proxyBlogRequest } from "@/app/lib/blogProxy";
interface RouteParams { params: Promise<{ id: string }> }
async function forward(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyBlogRequest(request, `/${encodeURIComponent(id)}`);
}
export const GET = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
