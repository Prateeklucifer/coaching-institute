import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import { Test } from "@/models";

/**
 * GET /api/tests
 * Fetches all tests, sorted by creation date (newest first)
 */
export async function GET() {
  try {
    await ConnectToDB();

    // Get all tests, sorted by creation date (newest first)
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'title',
        'description',
        'isActive',
        'timeLimit',
        'passingScore',
        'maxAttempts',
        'createdAt',
        'updatedAt'
      ]
    });

    return NextResponse.json({ 
      success: true,
      data: tests 
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch tests",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tests
 * Creates a new test
 */
export async function POST(request) {
  try {
    await ConnectToDB();
    
    const testData = await request.json();
    
    // Create new test
    const newTest = await Test.create(testData);
    
    return NextResponse.json({
      success: true,
      data: newTest
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating test:", error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation error',
          details: errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create test',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
