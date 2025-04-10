import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import @clerk/nextjs dynamically
    const clerkModule = await import("@clerk/nextjs");
    const clerkExports = Object.keys(clerkModule);

    return NextResponse.json({
      exports: clerkExports,
      message: "Use these exports in your code",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
