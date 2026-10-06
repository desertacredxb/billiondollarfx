import { connectToDatabase } from "@/app/lib/db";
import Blog from "@/app/models/Blogs";
import { NextResponse } from "next/server";

// GET: Fetch all records (supports dynamic querying by status, category, or search keywords)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    
    // Construct robust query object matrix
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } }
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, count: blogs.length, data: blogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Direct entry point for creating new blogs
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Enforce basic programmatic checks on required configurations
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required core fields (title, content, category)." },
        { status: 400 }
      );
    }

    const newBlog = await Blog.create(body);
    return NextResponse.json({ success: true, data: newBlog }, { status: 201 });
  } catch (error: any) {
    // Catch duplicate slug warnings from MongoDB engine
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A blog post with this title or slug already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}