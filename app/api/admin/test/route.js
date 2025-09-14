import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
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

// Create a new test
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

    const testData = await req.json();

    // Connect to database
    await ConnectToDB();

    // Create new test
    const test = await Test.create(testData);

    return NextResponse.json(
      { message: "Test created successfully", test },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test" },
      { status: 500 }
    );
  }
}

// Get all tests
export async function GET(req) {
  try {
    // Connect to database
    await ConnectToDB();

    // Get all tests, sorted by creation date
    const tests = await Test.find({})
      .sort({ createdAt: -1 })
      .select('-questions.correctOption'); // Don't send correct answers to client

    return NextResponse.json({ tests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}
