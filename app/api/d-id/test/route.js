import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the D-ID API key from environment
    const DID_API_KEY = process.env.DID_API_KEY;
    if (!DID_API_KEY) {
      return NextResponse.json(
        { error: "D-ID API key not configured" },
        { status: 500 }
      );
    }

    // Check if the API key has the format username:password
    const isCompositeKey = DID_API_KEY.includes(":");
    const keyParts = isCompositeKey ? DID_API_KEY.split(":") : [DID_API_KEY];

    // Mask the API key for security in the response
    const maskedKey =
      DID_API_KEY.substring(0, 8) +
      "..." +
      DID_API_KEY.substring(DID_API_KEY.length - 4);

    // Test the D-ID API connection
    const DID_API_URL = "https://api.d-id.com";
    const results = {};

    // Format 1: Direct API key
    try {
      const response1 = await fetch(`${DID_API_URL}/credits`, {
        headers: {
          Authorization: DID_API_KEY,
          "Content-Type": "application/json",
        },
      });

      results.directKey = {
        status: response1.status,
        ok: response1.ok,
      };

      if (response1.ok) {
        results.directKey.data = await response1.json();
      } else {
        results.directKey.error = await response1.text();
      }
    } catch (error) {
      results.directKey = { error: error.message };
    }

    // Format 2: Basic auth with complete key
    try {
      const response2 = await fetch(`${DID_API_URL}/credits`, {
        headers: {
          Authorization: `Basic ${Buffer.from(DID_API_KEY).toString("base64")}`,
          "Content-Type": "application/json",
        },
      });

      results.basicComplete = {
        status: response2.status,
        ok: response2.ok,
      };

      if (response2.ok) {
        results.basicComplete.data = await response2.json();
      } else {
        results.basicComplete.error = await response2.text();
      }
    } catch (error) {
      results.basicComplete = { error: error.message };
    }

    // Format 3: Bearer token
    try {
      const response3 = await fetch(`${DID_API_URL}/credits`, {
        headers: {
          Authorization: `Bearer ${DID_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      results.bearer = {
        status: response3.status,
        ok: response3.ok,
      };

      if (response3.ok) {
        results.bearer.data = await response3.json();
      } else {
        results.bearer.error = await response3.text();
      }
    } catch (error) {
      results.bearer = { error: error.message };
    }

    return NextResponse.json({
      message: "D-ID API connection test with different auth formats",
      apiKeyConfigured: true,
      maskedKey,
      isCompositeKey,
      keyFormat: isCompositeKey ? "username:password" : "simple",
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
