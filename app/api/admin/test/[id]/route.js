import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import { Test, User } from "@/models";
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

// Get a specific test
export async function GET(req, { params }) {
  const numericId = Number(params.id);
  try {
    await ConnectToDB();
    
    const test = await Test.findByPk(numericId);
    
    if (!test || (Array.isArray(test) && test.length === 0)) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    // Only verify admin for non-test-taking routes
    const url = new URL(req.url);
    const isTestTaking = url.pathname.includes('/dashboard/tests/');
    
    // If it's not a test-taking request and not an admin, remove correct answers
    if (!isTestTaking) {
      const authResult = await verifyAdmin(req);
      if (!authResult.success) {
        test.questions.forEach(question => {
          question.correctOption = undefined;
        });
      }
    }

    return NextResponse.json({ test }, { status: 200 });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

// Update a test
export async function PUT(req, { params }) {
  const numericId = Number(params.id);
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

    await ConnectToDB();

    await Test.update(
      {
        ...testData,
        updatedAt: new Date()
      },
      { where: { id: numericId } }
    );

    const test = await Test.findByPk(numericId);

    if (!test || (Array.isArray(test) && test.length === 0)) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Test updated successfully", test },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update test" },
      { status: 500 }
    );
  }
}

// Delete a test
export async function DELETE(req, { params }) {
  const numericId = Number(params.id);
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

    const deleted = await Test.destroy({ where: { id: numericId } });

    if (deleted === 0) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Test deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    );
  }
}
