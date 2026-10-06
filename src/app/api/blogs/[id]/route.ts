import Blog from "@/app/models/Blogs";
import { connectToDatabase } from "@/app/lib/db";
import { NextResponse } from "next/server";

// Define the parameters as a Promise
interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Individual full article fetch handler
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    
    // Await the dynamic routing params object explicitly
    const resolvedParams = await params; 
    const blog = await Blog.findById(resolvedParams.id);
    
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: blog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Full update method for general editing execution panels
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const body = await request.json();

    const updatedBlog = await Blog.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return NextResponse.json({ success: false, error: "Target document could not be found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Quick partial modifier specifically used to toggle status variables instantly
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const { status } = await request.json();

    if (!status || !["draft", "published", "archived"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value assignment." }, { status: 400 });
    }

    const updatePayload: any = { status };
    if (status === "published") updatePayload.publishedAt = new Date();

    const updatedBlog = await Blog.findByIdAndUpdate(
      resolvedParams.id,
      updatePayload,
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json({ success: false, error: "Target document could not be found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBlog });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hard deletion pipeline operation from systems
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const deletedBlog = await Blog.findByIdAndDelete(resolvedParams.id);

    if (!deletedBlog) {
      return NextResponse.json({ success: false, error: "Document not found or already purged." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Blog record permanently deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}