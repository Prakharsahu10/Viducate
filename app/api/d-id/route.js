import { NextResponse } from "next/server";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// POST /api/d-id - Generate a video using D-ID API
export async function POST(request) {
  try {
    console.log("D-ID API request received");

    const { userId } = getAuth(request);

    if (!userId) {
      console.log("Unauthorized: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated with Clerk ID:", userId);

    // Find the user in our database by clerkUserId
    let dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      console.log("User not found in database, creating new user record");
      // Get more details from Clerk if needed
      let clerkUser;
      try {
        clerkUser = await clerkClient.users.getUser(userId);
      } catch (error) {
        console.error("Error getting user from Clerk:", error);
      }

      // Create a new user if they don't exist yet
      try {
        const newUser = await db.user.create({
          data: {
            clerkUserId: userId,
            email:
              clerkUser?.emailAddresses?.[0]?.emailAddress ||
              "unknown@example.com",
            name: clerkUser
              ? `${clerkUser.firstName || ""} ${
                  clerkUser.lastName || ""
                }`.trim()
              : "Unknown User",
          },
        });
        console.log("Created new user in database:", newUser.id);
        dbUser = newUser;
      } catch (createError) {
        console.error("Failed to create user in database:", createError);
        return NextResponse.json(
          { error: "Failed to create user record" },
          { status: 500 }
        );
      }
    } else {
      console.log("User found in database, ID:", dbUser.id);
    }

    // Get data from request
    const requestData = await request.json();
    console.log("Request data received:", requestData);

    const {
      content,
      title,
      description = "",
      language = "en",
      avatarId = "default",
    } = requestData;

    // Validate required fields
    if (!content) {
      console.log("Missing content in request");
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    console.log("Creating database record for video with authorId:", dbUser.id);
    // Create a pending video record in the database first
    const pendingVideo = await db.video.create({
      data: {
        title: title || `Video ${new Date().toISOString().split("T")[0]}`,
        description,
        content,
        language,
        avatarId,
        status: "pending",
        authorId: dbUser.id, // Use the database user ID instead of Clerk ID
      },
    });

    console.log("Database record created:", pendingVideo.id);

    // Make request to D-ID API
    const DID_API_KEY = process.env.DID_API_KEY;
    if (!DID_API_KEY) {
      console.error("D-ID API key not configured");
      return NextResponse.json(
        { error: "D-ID API key not configured" },
        { status: 500 }
      );
    }

    console.log("Starting D-ID API request");
    // Base URL for D-ID API
    const DID_API_URL = "https://api.d-id.com";

    // Check if API key has username:password format
    const isCompositeKey = DID_API_KEY.includes(":");
    let authHeader;

    if (isCompositeKey) {
      // For username:api_key format, use Basic auth with base64 encoding
      const [username, apiKey] = DID_API_KEY.split(":");
      authHeader = `Basic ${Buffer.from(`${username}:${apiKey}`).toString(
        "base64"
      )}`;
      console.log("Using Basic auth with username:api_key format");
    } else {
      // Use the key directly
      authHeader = DID_API_KEY;
      console.log("Using direct API key format");
    }

    // Create a talk request with language configuration
    const talkParams = {
      script: {
        type: "text",
        input: content,
        provider: {
          type: "microsoft",
          voice_id: getVoiceForLanguage(language),
        },
      },
      config: {
        stitch: true,
      },
      presenter_id: getAvatarId(avatarId),
    };

    console.log("Request params:", JSON.stringify(talkParams));

    // Modify your fetch request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout

    try {
      const talkResponse = await fetch(`${DID_API_URL}/talks`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(talkParams),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout if fetch completes

      console.log("D-ID API response status:", talkResponse.status);

      if (!talkResponse.ok) {
        let errorData = { error: "Unknown D-ID API error" };
        try {
          const errorText = await talkResponse.text();
          console.error("Error response text:", errorText);
          try {
            // Only try to parse as JSON if it looks like JSON
            if (errorText.trim().startsWith("{")) {
              errorData = JSON.parse(errorText);
            } else {
              errorData = { error: errorText };
            }
          } catch (parseError) {
            errorData = { error: errorText };
          }
        } catch (textError) {
          errorData = { error: "Could not read error response" };
        }

        console.error("D-ID API error details:", JSON.stringify(errorData));

        // Update the video record to failed
        await db.video.update({
          where: { id: pendingVideo.id },
          data: { status: "failed" },
        });

        return NextResponse.json(
          {
            error: "Failed to generate video with D-ID API",
            details: errorData,
          },
          { status: 500 }
        );
      }

      const talkData = await talkResponse.json();
      console.log("D-ID API success response:", JSON.stringify(talkData));

      // Return the talk ID and database ID
      return NextResponse.json({
        message: "Video generation started",
        video_id: pendingVideo.id,
        talk_id: talkData.id,
        status: "pending",
      });
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("D-ID API request timed out");
        // Update video record to failed
        await db.video.update({
          where: { id: pendingVideo.id },
          data: { status: "failed" },
        });

        return NextResponse.json(
          { error: "D-ID API request timed out" },
          { status: 504 }
        );
      }
      // Handle other errors...
      console.error("Error generating video:", error);
      return NextResponse.json(
        { error: "Failed to generate video", details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating video:", error);
    return NextResponse.json(
      { error: "Failed to generate video", details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get avatar ID based on selection
function getAvatarId(avatarId) {
  // Default presenters from D-ID
  const presenters = {
    default: "amy",
    rian: "matthew",
    anna: "emma",
    daniel: "richard",
  };

  return presenters[avatarId] || presenters.default;
}

// Helper function to get the appropriate voice for a language
function getVoiceForLanguage(language) {
  const voiceMap = {
    en: "en-US-JennyNeural",
    es: "es-ES-ElviraNeural",
    hi: "hi-IN-SwaraNeural",
    fr: "fr-FR-DeniseNeural",
  };

  return voiceMap[language] || "en-US-JennyNeural"; // Default to English if no match
}
