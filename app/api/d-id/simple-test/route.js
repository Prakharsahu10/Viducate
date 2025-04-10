import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the D-ID API key
    const DID_API_KEY = process.env.DID_API_KEY;
    if (!DID_API_KEY) {
      return NextResponse.json(
        { error: "D-ID API key not configured" },
        { status: 500 }
      );
    }

    const DID_API_URL = "https://api.d-id.com";

    // First, let's check credits
    let creditsResponse;
    try {
      creditsResponse = await fetch(`${DID_API_URL}/credits`, {
        headers: {
          Authorization: DID_API_KEY,
        },
      });
      console.log("Credits response status:", creditsResponse.status);
    } catch (error) {
      console.error("Credits check failed:", error);
    }

    // Prepare a very simple talk request
    const simpleScript = {
      script: {
        type: "text",
        input: "Hello, this is a test video.",
      },
      presenter_id: "amy",
    };

    // Try different authorization formats
    const results = {};

    // Format 1: Raw key
    try {
      const response1 = await fetch(`${DID_API_URL}/talks`, {
        method: "POST",
        headers: {
          Authorization: DID_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simpleScript),
      });

      console.log("Format 1 status:", response1.status);
      results.format1 = {
        status: response1.status,
        ok: response1.ok,
        responseData: await response1.text(),
      };
    } catch (error) {
      results.format1 = { error: error.message };
    }

    // Format 2: Basic username:password
    if (DID_API_KEY.includes(":")) {
      try {
        const [username, password] = DID_API_KEY.split(":");
        const basicAuth = Buffer.from(`${username}:${password}`).toString(
          "base64"
        );

        const response2 = await fetch(`${DID_API_URL}/talks`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(simpleScript),
        });

        console.log("Format 2 status:", response2.status);
        results.format2 = {
          status: response2.status,
          ok: response2.ok,
          responseData: await response2.text(),
        };
      } catch (error) {
        results.format2 = { error: error.message };
      }
    }

    // Format 3: As bearer token
    try {
      const response3 = await fetch(`${DID_API_URL}/talks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simpleScript),
      });

      console.log("Format 3 status:", response3.status);
      results.format3 = {
        status: response3.status,
        ok: response3.ok,
        responseData: await response3.text(),
      };
    } catch (error) {
      results.format3 = { error: error.message };
    }

    // Return all results
    return NextResponse.json({
      message: "D-ID simple test with different auth formats",
      hasColonInKey: DID_API_KEY.includes(":"),
      creditsStatus: creditsResponse?.status,
      results,
    });
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
