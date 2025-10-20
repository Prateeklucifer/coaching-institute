import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

// Simple test endpoint to check authentication
export async function POST(request) {
  try {
    // Check if we can get the session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Try to parse the request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          details: error.message
        },
        { status: 400 }
      );
    }

    // Return a simple success response with the received data
    return NextResponse.json({
      success: true,
      message: 'Test submission received',
      timestamp: new Date().toISOString(),
      session: {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email
        }
      },
      receivedData: body
    });

  } catch (error) {
    console.error('Error in test submission:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        name: error.name
      })
    }, { status: 500 });
  }
}

// Also add a GET method for testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test submission endpoint is working',
    timestamp: new Date().toISOString(),
    instructions: 'Send a POST request with your test data to submit a test'
  });
}
