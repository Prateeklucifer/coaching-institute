import { NextResponse } from 'next/server';
import ConnectToDB from '@/DB/ConnectToDB';

export async function GET() {
  try {
    // Test database connection
    await ConnectToDB();
    
    // Test environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      MYSQL_HOST: process.env.MYSQL_HOST ? 'set' : 'not set',
      MYSQL_DB_NAME: process.env.MYSQL_DB_NAME ? 'set' : 'not set',
      MYSQL_USER: process.env.MYSQL_USER ? 'set' : 'not set',
      MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? 'set' : 'not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
    };

    return NextResponse.json({
      success: true,
      message: 'Test endpoint is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'POST request received',
    timestamp: new Date().toISOString()
  });
}
