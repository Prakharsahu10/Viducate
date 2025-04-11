"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

const Challenges = ({ challenges = [] }) => {
  const router = useRouter();
  
  // Sample challenges data if none provided
  const sampleChallenges = [
    {
      id: 1,
      title: "Video Creation Master",
      description: "Create 5 educational videos on different topics",
      progress: 2,
      total: 5,
      points: 50,
      category: "creation",
      difficulty: "medium",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      id: 2,
      title: "Learning Streak",
      description: "Log in for 5 consecutive days",
      progress: 3,
      total: 5,
      points: 25,
      category: "engagement",
      difficulty: "easy",
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      id: 3,
      title: "Physics Challenge",
      description: "Complete the physics quiz with at least 80% score",
      progress: 0,
      total: 1,
      points: 100,
      category: "quiz",
      difficulty: "hard",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      quizId: 123,
    },
    {
      id: 4,
      title: "Video Tutorial Explorer",
      description: "Watch videos in 3 different subject areas",
      progress: 1,
      total: 3,
      points: 30,
      category: "exploration",
      difficulty: "easy",
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  ];
  
  const displayChallenges = challenges.length > 0 ? challenges : sampleChallenges;
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  
  const getCategoryEmoji = (category) => {
    switch (category) {
      case "creation":
        return "🎬";
      case "engagement":
        return "⚡";
      case "quiz":
        return "🧠";
      case "exploration":
        return "🔍";
      default:
        return "🏆";
    }
  };
  
  const handleChallengeAction = (challenge) => {
    if (challenge.category === "quiz" && challenge.quizId) {
      router.push(`/quiz/${challenge.quizId}`);
    } else {
      // For non-quiz challenges, show details or info on how to complete
      console.log("Challenge details:", challenge);
      // Implement your logic for other challenge types
    }
  };
  
  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return "Expired";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-indigo-700">Daily Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayChallenges.map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryEmoji(challenge.category)}</span>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                </div>
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: {challenge.progress}/{challenge.total}</span>
                  <span>{challenge.points} XP</span>
                </div>
                <Progress 
                  value={(challenge.progress / challenge.total) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500 text-right">
                  {getTimeRemaining(challenge.expiresAt)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant={challenge.category === "quiz" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleChallengeAction(challenge)}
              >
                {challenge.category === "quiz" ? "Take Quiz" : "View Details"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="pt-4 flex justify-center">
        <Button variant="ghost" className="text-indigo-600">
          View All Challenges
        </Button>
      </div>
    </div>
  );
};

export default Challenges; 