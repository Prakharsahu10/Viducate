"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BadgesGallery = ({ userBadges = [], userAchievements = [] }) => {
  // Sample data if none provided
  const sampleBadges = [
    {
      id: 1,
      name: "First Video",
      description: "Created your first educational video",
      imageUrl: "/badges/first-video.png",
      emoji: "🎬",
      earned: true,
      earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: "Engagement Star",
      description: "Logged in for 7 consecutive days",
      imageUrl: "/badges/streak.png",
      emoji: "⭐",
      earned: true,
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      name: "Quiz Master",
      description: "Scored 100% on three different quizzes",
      imageUrl: "/badges/quiz-master.png",
      emoji: "🧠",
      earned: false,
    },
    {
      id: 4,
      name: "Content Creator",
      description: "Created 10 educational videos",
      imageUrl: "/badges/creator.png",
      emoji: "🏆",
      earned: false,
    },
    {
      id: 5,
      name: "Polyglot",
      description: "Created videos in 3 different languages",
      imageUrl: "/badges/languages.png",
      emoji: "🌎",
      earned: false,
    },
    {
      id: 6,
      name: "Early Bird",
      description: "Used the platform before 8 AM for 5 days",
      imageUrl: "/badges/early-bird.png",
      emoji: "🌅",
      earned: false,
    },
  ];

  const sampleAchievements = [
    {
      id: 1,
      name: "Video Pioneer",
      description: "Created the first 5 educational videos",
      imageUrl: "/achievements/pioneer.png",
      emoji: "🚀",
      earned: true,
      earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      progress: 100,
      total: 100,
    },
    {
      id: 2,
      name: "Knowledge Explorer",
      description: "Watched videos from 10 different categories",
      imageUrl: "/achievements/explorer.png",
      emoji: "🔍",
      earned: false,
      progress: 60,
      total: 100,
    },
    {
      id: 3,
      name: "Quiz Champion",
      description: "Completed all quizzes with at least 90% score",
      imageUrl: "/achievements/champion.png",
      emoji: "🏅",
      earned: false,
      progress: 30,
      total: 100,
    },
    {
      id: 4,
      name: "Dedication Award",
      description: "Used the platform every day for a month",
      imageUrl: "/achievements/dedication.png",
      emoji: "📅",
      earned: false,
      progress: 20,
      total: 100,
    },
  ];

  const displayBadges = userBadges.length > 0 ? userBadges : sampleBadges;
  const displayAchievements = userAchievements.length > 0 ? userAchievements : sampleAchievements;
  
  const [activeTab, setActiveTab] = useState("badges");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center text-indigo-700">
            Your Accomplishments
          </CardTitle>
          <div className="flex border border-gray-200 rounded-md overflow-hidden mt-4">
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'badges' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600'}`}
              onClick={() => setActiveTab('badges')}
            >
              Badges
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'achievements' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-600'}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displayBadges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`relative p-4 rounded-lg flex flex-col items-center text-center ${
                    badge.earned 
                      ? 'bg-gradient-to-b from-indigo-50 to-purple-50 border border-indigo-200' 
                      : 'bg-gray-100 border border-gray-200 opacity-70'
                  }`}
                >
                  {badge.earned && (
                    <Badge className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs">
                      Earned
                    </Badge>
                  )}
                  
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                    badge.earned ? 'bg-gradient-to-br from-indigo-100 to-purple-200' : 'bg-gray-200'
                  }`}>
                    <span className="text-3xl">{badge.emoji}</span>
                  </div>
                  
                  <h3 className="font-semibold text-sm">{badge.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  
                  {badge.earned && badge.earnedAt && (
                    <p className="text-xs text-indigo-600 mt-2">
                      Earned on {formatDate(badge.earnedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayAchievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-lg border ${
                    achievement.earned 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-amber-200' : 'bg-gray-200'
                    }`}>
                      <span className="text-2xl">{achievement.emoji || "🎯"}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        {achievement.earned && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      
                      {!achievement.earned && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 rounded-full" 
                              style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {achievement.progress}% complete
                          </p>
                        </div>
                      )}
                      
                      {achievement.earned && achievement.earnedAt && (
                        <p className="text-xs text-amber-600 mt-2">
                          Achieved on {formatDate(achievement.earnedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgesGallery; 