import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";

// Get a specific test
export async function GET(req, { params }) {
  try {
    await ConnectToDB();
    
    const test = await Test.findById(params.id);
    
    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
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
