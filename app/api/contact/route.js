import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    // Log the start of the request
    console.log("Contact form submission received");

    // Parse the request body
    const body = await req.json();
    console.log("Received form data:", JSON.stringify(body));

    const { name, email, subject, message, newsletter } = body;

    // Validate required fields
    if (!name || !email || !message) {
      console.log("Validation failed: Missing required fields");
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      );
    }

    console.log("Creating contact record in database");
    // Create the contact record in the database
    const newContact = await db.contact.create({
      data: {
        name,
        email,
        subject: subject || "No subject",
        message,
        newsletter: newsletter || false,
        status: "unread",
      },
    });

    console.log("Contact record created successfully:", newContact.id);
    return NextResponse.json(
      {
        success: true,
        message: "Contact information submitted successfully",
        contact: newContact,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in contact form submission:", error.message);
    console.error("Error stack:", error.stack);

    // Check for specific database-related errors
    if (error.code) {
      console.error("Database error code:", error.code);
    }

    return NextResponse.json(
      { error: "Failed to submit contact information", details: error.message },
      { status: 500 }
    );
  }
}
