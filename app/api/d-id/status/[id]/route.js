import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// GET /api/d-id/status/[id]?talk_id=xxx - Check status of D-ID video
export async function GET(request, { params }) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated with Clerk ID:", userId);

    // Find the user in our database by clerkUserId
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found in database, ID:", dbUser.id);

    const videoId = parseInt(params.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    // Get the talk_id from query parameters
    const { searchParams } = new URL(request.url);
    const talkId = searchParams.get("talk_id");

    if (!talkId) {
      return NextResponse.json(
        { error: "Missing talk_id parameter" },
        { status: 400 }
      );
    }

    // First check if the video exists and belongs to the user
    const existingVideo = await db.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (existingVideo.authorId !== dbUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If the video is already completed, just return it
    if (existingVideo.status === "completed" && existingVideo.videoUrl) {
      return NextResponse.json({
        status: "completed",
        video_id: existingVideo.id,
        video_url: existingVideo.videoUrl,
      });
    }

    // Check status with D-ID API
    const DID_API_KEY = process.env.DID_API_KEY;
    if (!DID_API_KEY) {
      return NextResponse.json(
        { error: "D-ID API key not configured" },
        { status: 500 }
      );
    }

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

    const statusResponse = await fetch(`${DID_API_URL}/talks/${talkId}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: "Failed to check status with D-ID API" },
        { status: 500 }
      );
    }

    const statusData = await statusResponse.json();

    // Update the video status in the database
    let dbStatus = existingVideo.status;

    if (statusData.status === "done") {
      dbStatus = "completed";

      // Update the video in the database with the URL
      await db.video.update({
        where: { id: videoId },
        data: {
          status: "completed",
          videoUrl: statusData.result_url,
        },
      });
    } else if (
      statusData.status === "started" ||
      statusData.status === "created"
    ) {
      dbStatus = "processing";

      // Update the processing status
      await db.video.update({
        where: { id: videoId },
        data: { status: "processing" },
      });
    } else if (statusData.status === "error") {
      dbStatus = "failed";

      // Update with error status
      await db.video.update({
        where: { id: videoId },
        data: { status: "failed" },
      });
    }

    // Return the status and video details
    return NextResponse.json({
      status: dbStatus,
      video_id: videoId,
      video_url: statusData.result_url || null,
      d_id_status: statusData.status,
    });
  } catch (error) {
    console.error("Error checking video status:", error);
    return NextResponse.json(
      { error: "Failed to check video status", details: error.message },
      { status: 500 }
    );
  }
}
