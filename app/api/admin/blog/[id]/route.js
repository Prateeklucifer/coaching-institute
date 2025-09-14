import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Blog from "@/schema/Blogs";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";

// Verify admin authentication
async function verifyAdmin(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    const user = await Users.findById(decoded.userId).select('-password');

    if (!user || !user.isAdmin) {
      return { success: false, error: 'Unauthorized access' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Get a specific blog post
export async function GET(req, { params }) {
  try {
    await ConnectToDB();
    
    const blog = await Blog.findById(params.id).select('-__v');
    
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// Update a blog post
export async function PUT(req, { params }) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      coverImage
    } = await req.json();

    await ConnectToDB();

    const blog = await Blog.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        paragraphOne,
        paragraphTwo,
        paragraphThree,
        coverImage,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blog updated successfully", blog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// Delete a blog post
export async function DELETE(req, { params }) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await ConnectToDB();

    const blog = await Blog.findByIdAndDelete(params.id);

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
