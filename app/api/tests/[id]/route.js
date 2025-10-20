import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import { Test } from "@/models";

/**
 * GET /api/tests/[id]
 * Fetches a specific test by ID
 */
export async function GET(request, { params }) {
  try {
    await ConnectToDB();
    
    const test = await Test.findByPk(params.id);
    
    if (!test) {
      return NextResponse.json(
        { 
          success: false,
          error: "Test not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: test 
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch test",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tests/[id]
 * Updates an existing test
 */
export async function PUT(request, { params }) {
  try {
    await ConnectToDB();
    
    const test = await Test.findByPk(params.id);
    
    if (!test) {
      return NextResponse.json(
        { 
          success: false,
          error: "Test not found" 
        },
        { status: 404 }
      );
    }
    
    const updates = await request.json();
    
    // Don't allow updating the ID
    if (updates.id) {
      delete updates.id;
    }
    
    // Update the test
    await test.update(updates);
    
    // Fetch the updated test to ensure we have the latest data
    const updatedTest = await Test.findByPk(params.id);
    
    return NextResponse.json({
      success: true,
      data: updatedTest
    });
    
  } catch (error) {
    console.error("Error updating test:", error);
    
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
        error: 'Failed to update test',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tests/[id]
 * Deletes a specific test
 */
export async function DELETE(request, { params }) {
  try {
    await ConnectToDB();
    
    const test = await Test.findByPk(params.id);
    
    if (!test) {
      return NextResponse.json(
        { 
          success: false,
          error: "Test not found" 
        },
        { status: 404 }
      );
    }
    
    // Delete the test
    await test.destroy();
    
    return NextResponse.json({
      success: true,
      message: "Test deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting test:", error);
    
    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot delete test as it is being referenced by other records'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete test',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
