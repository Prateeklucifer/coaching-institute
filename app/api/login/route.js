import { User } from "@/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import sequelize from "@/DB/sequelize";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ 
      where: { email },
      raw: true // Return plain object instead of Sequelize instance
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json(
      { 
        message: "Login successful",
        user: { 
          id: user.id,
          name: user.name, 
          email: user.email,
          isAdmin: user.isAdmin
        }
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.name === 'SequelizeConnectionError') {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "An error occurred during login. Please try again later." },
      { status: 500 }
    );
  }
}
