import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

// GET /api/videos/[id]
export async function GET(request, { params }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = parseInt(params.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const video = await db.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Check if the video belongs to the current user
    if (video.authorId !== parseInt(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// PATCH /api/videos/[id]
export async function PATCH(request, { params }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = parseInt(params.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
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

    if (existingVideo.authorId !== parseInt(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the update data
    const updateData = await request.json();

    // Update the video
    const updatedVideo = await db.video.update({
      where: {
        id: videoId,
      },
      data: updateData,
    });

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[id]
export async function DELETE(request, { params }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videoId = parseInt(params.id);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
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

    if (existingVideo.authorId !== parseInt(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the video
    await db.video.delete({
      where: {
        id: videoId,
      },
    });

    return NextResponse.json(
      { message: "Video deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
