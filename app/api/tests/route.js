import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";

// Get all tests
export async function GET(req) {
  try {
    // Connect to database
    await ConnectToDB();

    // Get all tests, sorted by creation date
    const tests = await Test.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json({ tests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}
