"use client";

import React, { useState, useEffect } from "react";
import GamificationSidebar from "@/components/gamification/GamificationSidebar";
import Leaderboard from "@/components/gamification/Leaderboard";
import Challenges from "@/components/gamification/Challenges";
import BadgesGallery from "@/components/gamification/BadgesGallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GamificationPage = () => {
  const [userStats, setUserStats] = useState({
    points: 320,
    level: 4,
    streak: 3,
    badges: [],
    achievements: [],
    rank: 15
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchUserGamificationData = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from API - in real implementation
        // const response = await fetch("/api/user/gamification");
        // const data = await response.json();
        // setUserStats(data.stats);
        
        // For now, simulate API call with timeout
        setTimeout(() => {
          setUserStats({
            points: 320,
            level: 4,
            streak: 3,
            badges: [
              {
                id: 1,
                name: "First Video",
                description: "Created your first educational video",
                emoji: "🎬",
                earned: true,
                earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              },
              {
                id: 2,
                name: "Engagement Star",
                description: "Logged in for 7 consecutive days",
                emoji: "⭐",
                earned: true,
                earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              }
            ],
            achievements: [
              {
                id: 1,
                name: "Video Pioneer",
                description: "Created the first 5 educational videos",
                emoji: "🚀",
                earned: true,
                earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              }
            ],
            rank: 15
          });
          setIsLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Error fetching gamification data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchUserGamificationData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Error loading gamification data: {error}
      </div>
    );
  }
  
  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Student Achievements
        </h1>
        <p className="text-gray-600 mt-2">
          Track your progress, earn rewards, and compete with other students!
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar with user stats */}
        <div className="lg:col-span-1">
          <GamificationSidebar userStats={userStats} />
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="challenges">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="challenges">
              <Challenges />
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <Leaderboard />
            </TabsContent>
            
            <TabsContent value="badges">
              <BadgesGallery 
                userBadges={userStats.badges} 
                userAchievements={userStats.achievements} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage; 