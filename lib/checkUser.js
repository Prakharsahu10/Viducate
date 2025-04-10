import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  console.log("Checking user:", user.id);

  try {
    // Check if user exists first
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existingUser) {
      console.log("User found in database:", existingUser.id);
      return existingUser;
    }

    console.log("User not found, creating new user:", user.id);
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    // Create a new user if they don't exist
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    console.log("New user created:", newUser.id);
    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    return null;
  }
};
