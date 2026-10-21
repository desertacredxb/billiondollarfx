import { proxyBlogRequest } from "@/app/lib/blogProxy";
export const POST = (request: Request) => proxyBlogRequest(request, "/seo");
