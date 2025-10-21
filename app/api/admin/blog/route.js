import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import { Blog, User } from "@/models";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Verify admin authentication
async function verifyAdmin(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.userId, { attributes: { exclude: ['password'] } });

    if (!user || !user.isAdmin) {
      return { success: false, error: 'Unauthorized access' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Create a new blog post
export async function POST(req) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Parse request body
    const {
      title,
      description,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      coverImage
    } = await req.json();

    // Connect to database
    await ConnectToDB();

    // Create new blog post
    const blog = await Blog.create({
      title,
      description,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      coverImage
    });

    return NextResponse.json(
      { message: "Blog created successfully", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

// Get all blog posts
export async function GET(req) {
  try {
    // Connect to database
    await ConnectToDB();

    // Get all blogs, sorted by creation date
    const blogs = await Blog.findAll({ order: [['createdAt', 'DESC']] });

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
