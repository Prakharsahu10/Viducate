import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import OpenAI from "openai";

// Initialize OpenAI client with better error handling
const apiKey = process.env.OPENAI_API_KEY;
console.log("API Key available:", !!apiKey); // Log if API key exists (without showing the key)

let openai;
try {
  openai = new OpenAI({
    apiKey: apiKey || "", // Handle undefined case
  });
} catch (err) {
  console.error("Error initializing OpenAI:", err.message);
}

// Fallback function to generate a simple quiz without OpenAI
function generateFallbackQuiz(content, difficulty) {
  console.log("Using fallback quiz generation");
  
  // Split content into sentences for basic analysis
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Extract keywords (very simple approach)
  const keywords = content.split(/\s+/)
    .filter(word => word.length > 5)
    .filter(word => !["about", "there", "their", "would", "should", "could"].includes(word.toLowerCase()));
  
  // Create simple questions
  const questions = [];
  
  // Add a "what is" question
  if (sentences.length > 2) {
    const sentence = sentences[1].trim();
    if (sentence.length > 20) {
      questions.push({
        question: `What is being described in the following: "${sentence}"?`,
        options: [
          "The main topic of the content",
          "An unrelated concept",
          "A secondary character",
          "A historical event"
        ],
        correctOptionIndex: 0
      });
    }
  }
  
  // Add a keyword question
  if (keywords.length > 5) {
    const keyword = keywords[3];
    questions.push({
      question: `Which of the following best relates to "${keyword}"?`,
      options: [
        "It's a central concept in the content",
        "It's mentioned only briefly",
        "It's not related to the main topic",
        "It's a technical term from another field"
      ],
      correctOptionIndex: 0
    });
  }
  
  // Add a multiple choice question about the content
  if (sentences.length > 0) {
    questions.push({
      question: "What is the main topic of this content?",
      options: [
        extractMainTopic(content),
        "Space exploration",
        "Ancient history",
        "Quantum physics"
      ],
      correctOptionIndex: 0
    });
  }
  
  // Add a true/false question
  questions.push({
    question: "Based on the content, is the following statement true: This material covers educational content?",
    options: [
      "True",
      "False",
      "Not mentioned",
      "Partially true"
    ],
    correctOptionIndex: 0
  });
  
  // Add a question about educational value
  questions.push({
    question: "How would you describe the educational value of this content?",
    options: [
      "Informative and educational",
      "Entertainment only",
      "Technical documentation",
      "Not educational"
    ],
    correctOptionIndex: 0
  });
  
  return questions;
}

// Helper function to extract a simple main topic
function extractMainTopic(content) {
  // Very simple approach - just get the first few words
  const firstSentence = content.split('.')[0];
  if (firstSentence.length > 30) {
    return firstSentence.substring(0, 30) + "...";
  } else {
    return firstSentence;
  }
}

// POST /api/quiz/generate
export async function POST(request) {
  try {
    // Check if OpenAI is properly initialized
    if (!openai) {
      console.error("OpenAI client is not initialized");
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }

    // Check if API key is available
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      return NextResponse.json(
        { error: "AI service missing credentials" },
        { status: 500 }
      );
    }

    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Accept either videoId or direct content
    const { videoId, content, title, difficulty = "medium" } = await request.json();

    let quizContent = content;
    let quizTitle = title || "Custom Quiz";
    let videoReference = null;

    // If videoId is provided, get the content from the video
    if (videoId && !content) {
      // Get the video content
      const video = await db.video.findUnique({
        where: { id: parseInt(videoId) },
      });

      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      // Check if video belongs to user
      if (video.authorId !== dbUser.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      quizContent = video.content;
      quizTitle = `Quiz on ${video.title}`;
      videoReference = video.id;
    } else if (!content) {
      return NextResponse.json(
        { error: "Either videoId or content is required" },
        { status: 400 }
      );
    }

    console.log("Generating quiz");
    
    let quizData;
    
    // Try OpenAI if available, otherwise use fallback
    if (openai && apiKey) {
      try {
        console.log("Content for quiz generation:", quizContent.substring(0, 100) + "...");
        
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Using a more widely available model
          messages: [
            {
              role: "system",
              content: `You are an education expert who creates high-quality quiz questions based on educational content. 
              Create 5 multiple-choice questions with 4 options each based on the following content. 
              The difficulty level should be: ${difficulty}.
              Format your response as a JSON array with the following structure:
              [
                {
                  "question": "Question text here?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctOptionIndex": 0  // Index of the correct answer (0-3)
                }
              ]`
            },
            {
              role: "user",
              content: quizContent
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        console.log("OpenAI response received");
        
        if (!response.choices || !response.choices[0] || !response.choices[0].message) {
          console.error("Unexpected OpenAI response format:", response);
          return NextResponse.json(
            { error: "Invalid response from AI service" },
            { status: 500 }
          );
        }

        const responseContent = response.choices[0].message.content;
        console.log("OpenAI response content:", responseContent.substring(0, 100) + "...");
        
        try {
          // Check if the response starts with HTML tags, which would indicate an error
          if (responseContent.trim().startsWith('<!DOCTYPE') || 
              responseContent.trim().startsWith('<html') || 
              responseContent.trim().startsWith('<')) {
            console.error("Received HTML instead of JSON:", responseContent.substring(0, 200));
            return NextResponse.json(
              { error: "Received invalid response format from AI service" },
              { status: 500 }
            );
          }
          
          // Clean the response - sometimes OpenAI might include backticks or code blocks
          let cleanedResponse = responseContent;
          if (responseContent.includes('```json')) {
            cleanedResponse = responseContent.split('```json')[1].split('```')[0].trim();
          } else if (responseContent.includes('```')) {
            cleanedResponse = responseContent.split('```')[1].split('```')[0].trim();
          }
          
          quizData = JSON.parse(cleanedResponse);
          console.log("Parsed quiz data:", quizData.length, "questions");
          
          if (!Array.isArray(quizData) || quizData.length === 0) {
            throw new Error("Invalid quiz data format");
          }
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError, "Response was:", responseContent);
          return NextResponse.json(
            { error: "Failed to parse quiz data from AI service" },
            { status: 500 }
          );
        }
      } catch (openaiError) {
        console.error("Error with OpenAI API, using fallback:", openaiError);
        quizData = generateFallbackQuiz(quizContent, difficulty);
      }
    } else {
      console.log("OpenAI not available, using fallback quiz generation");
      quizData = generateFallbackQuiz(quizContent, difficulty);
    }
    
    // If we still don't have quiz data, use fallback
    if (!quizData) {
      quizData = generateFallbackQuiz(quizContent, difficulty);
    }

    // Create quiz in database
    const quiz = await db.quiz.create({
      data: {
        title: quizTitle,
        description: videoReference ? `Generated quiz for video ID: ${videoReference}` : "Generated from user content",
        difficulty,
        points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 25,
        questions: {
          create: quizData.map(q => ({
            text: q.question,
            options: q.options,
            correctOption: q.correctOptionIndex
          }))
        }
      },
      include: {
        questions: true
      }
    });

    console.log("Quiz created in database:", quiz.id);

    // Award achievement for creating a quiz (if it's their first quiz)
    const existingAchievement = await db.userAchievement.findFirst({
      where: {
        userId: dbUser.id,
        achievement: {
          name: "Quiz Creator"
        }
      }
    });

    if (!existingAchievement) {
      // Find the achievement ID
      const achievement = await db.achievement.findUnique({
        where: { name: "Quiz Creator" }
      });

      if (achievement) {
        // Create the user achievement
        await db.userAchievement.create({
          data: {
            userId: dbUser.id,
            achievementId: achievement.id
          }
        });

        // Award points to the user
        await db.user.update({
          where: { id: dbUser.id },
          data: {
            points: { increment: achievement.points }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      quiz
    });
      
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz", details: error.message },
      { status: 500 }
    );
  }
} 