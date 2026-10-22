import { proxyBlogRequest } from "@/app/lib/blogProxy";
export const GET = (request: Request) => proxyBlogRequest(request);
export const POST = (request: Request) => proxyBlogRequest(request);
