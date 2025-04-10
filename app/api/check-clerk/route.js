import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all available exports from @clerk/nextjs
    const clerkExports = Object.keys(require("@clerk/nextjs"));

    // Get version of @clerk/nextjs
    const packageJson = require("@clerk/nextjs/package.json");
    const version = packageJson.version;

    return NextResponse.json({
      version,
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
