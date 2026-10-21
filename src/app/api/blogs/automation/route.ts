import { proxyBlogRequest } from "@/app/lib/blogProxy";
export const GET = (request: Request) => proxyBlogRequest(request, "/automation");
export const PATCH = (request: Request) => proxyBlogRequest(request, "/automation");
