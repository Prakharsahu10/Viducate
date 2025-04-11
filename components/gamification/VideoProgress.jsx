"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VideoProgress = ({ videoId, initialProgress = 0 }) => {
  const [progress, setProgress] = useState(initialProgress);
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    // Listen for video progress updates
    const handleProgressUpdate = (progress) => {
      setProgress(progress);
      
      // Check for milestone rewards
      if (progress >= 25 && progress < 30 && !showReward) {
        setReward({
          title: "Getting Started",
          description: "You've watched 25% of the video",
          points: 5
        });
        setShowReward(true);
      } else if (progress >= 50 && progress < 55 && !showReward) {
        setReward({
          title: "Halfway There",
          description: "You've watched 50% of the video",
          points: 10
        });
        setShowReward(true);
      } else if (progress >= 75 && progress < 80 && !showReward) {
        setReward({
          title: "Almost There",
          description: "You've watched 75% of the video",
          points: 15
        });
        setShowReward(true);
      } else if (progress >= 100 && !showReward) {
        setReward({
          title: "Video Complete!",
          description: "You've finished watching the entire video",
          points: 25,
          badge: {
            name: "Video Explorer",
            emoji: "🔍"
          }
        });
        setShowReward(true);
      }
    };

    // In a real implementation, we would register event listeners
    // For this example, we'll simulate progress
    const interval = setInterval(() => {
      if (initialProgress < 100) {
        // Increment progress by a small amount
        const newProgress = Math.min(initialProgress + Math.random() * 10, 100);
        handleProgressUpdate(newProgress);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [initialProgress, showReward]);

  const claimReward = async () => {
    try {
      // In a real implementation, we would call an API to claim the reward
      // For now, just simulate it
      console.log(`Reward Claimed! You've earned ${reward.points} XP${reward.badge ? " and a badge!" : "!"}`);

      setShowReward(false);
      
      // Wait a bit before allowing new rewards
      setTimeout(() => {
        setReward(null);
      }, 1000);
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Video Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{Math.round(progress)}% completed</span>
              <span>{progress >= 100 ? "Completed" : "In progress"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReward && (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold text-amber-800">
                🎉 {reward.title}
              </CardTitle>
              <Badge className="bg-green-100 text-green-700">
                +{reward.points} XP
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-amber-700">{reward.description}</p>
            {reward.badge && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <span className="text-xl">{reward.badge.emoji}</span>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800">New Badge!</h4>
                  <p className="text-sm text-amber-700">{reward.badge.name}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              onClick={claimReward}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              Claim Reward
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default VideoProgress; 