"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // Add state for user statistics
  const [userStats, setUserStats] = useState({
    videosByStatus: {
      total: 0,
      completed: 0,
      pending: 0,
      processing: 0,
      failed: 0,
    },
    totalDuration: 0,
    dailyActivity: [],
    languageBreakdown: [],
  });
  
  // Gamification state
  const [gamificationStats, setGamificationStats] = useState({
    points: 0,
    level: 1,
    streak: 0,
    nextLevelPoints: 100,
    badges: [],
    rank: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [avatar, setAvatar] = useState("default");
  const [loading, setLoading] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [challenges, setChallenges] = useState([]);

  const router = useRouter();
  const fileInputRef = useRef(null);

  // Add useEffect to fetch user statistics and gamification data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user stats
        const statsResponse = await fetch("/api/user/stats");
        if (!statsResponse.ok) {
          throw new Error("Failed to fetch user statistics");
        }
        const statsData = await statsResponse.json();
        
        setUserStats(
          statsData.stats || {
            videosByStatus: {
              total: 0,
              completed: 0,
              pending: 0,
              processing: 0,
              failed: 0,
            },
            totalDuration: 0,
            dailyActivity: [],
            languageBreakdown: [],
          }
        );
        
        // Mock gamification data (replace with actual API call when implemented)
        setGamificationStats({
          points: 320,
          level: 4,
          streak: 3,
          nextLevelPoints: 400,
          badges: [
            {
              id: 1,
              name: "First Video",
              description: "Created your first educational video",
              emoji: "🎬"
            },
            {
              id: 2,
              name: "Engagement Star",
              description: "Logged in for 7 consecutive days",
              emoji: "⭐"
            }
          ],
          rank: 15
        });
        
        // Mock challenge data
        setChallenges([
          {
            id: 1,
            title: "Create 3 Videos",
            description: "Create 3 educational videos this week",
            progress: 1,
            total: 3,
            points: 30,
            daysLeft: 5
          },
          {
            id: 2,
            title: "Language Explorer",
            description: "Create videos in 2 different languages",
            progress: 1,
            total: 2,
            points: 25,
            daysLeft: 3
          }
        ]);
        
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Create dynamic chart data based on the API response
  const listeningData = {
    labels: userStats.dailyActivity
      .map((day) => {
        const date = new Date(day.date);
        return date.toLocaleDateString("en-US", { weekday: "short" });
      })
      .reverse(),
    datasets: [
      {
        label: "Minutes Watched",
        data: userStats.dailyActivity.map((day) => day.duration).reverse(),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366F1",
        tension: 0.4,
      },
    ],
  };

  const activityData = {
    labels: userStats.languageBreakdown.map((lang) => {
      // Map language codes to readable names
      const languageNames = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        zh: "Chinese",
        hi: "Hindi",
        unknown: "Unknown",
      };

      return languageNames[lang.language] || lang.language;
    }),
    datasets: [
      {
        label: "Videos by Language",
        data: userStats.languageBreakdown.map((lang) => lang.count),
        backgroundColor: [
          "#6366F1", // Indigo
          "#EC4899", // Pink
          "#FBBF24", // Yellow
          "#10B981", // Green
          "#3B82F6", // Blue
          "#8B5CF6", // Purple
          "#9CA3AF", // Gray
        ],
      },
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Use our new API route to generate the video through D-ID
      const response = await fetch("/api/d-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          title: `Video ${new Date().toISOString().split("T")[0]}`,
          description: text,
          language: language,
          avatarId: avatar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate video");
      }

      const data = await response.json();
      console.log("Video generation started:", data);

      // Store the talk_id for status checking
      localStorage.setItem(`talk_id_${data.video_id}`, data.talk_id);

      // Redirect to the video status page
      router.push(`/videos/${data.video_id}`);
    } catch (error) {
      setError(error.message);
      console.error("Error generating video:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCustomAvatar(e.target.files[0]);
    }
  };

  // Calculate progress percentage for level
  const progressToNextLevel = Math.min(
    Math.floor((gamificationStats.points / gamificationStats.nextLevelPoints) * 100),
    100
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Student Dashboard
        </h1>
        <p className="text-gray-500">
          Create and manage your educational videos
        </p>
      </div>

      {/* Gamification Level Bar */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 shadow-[0_0_10px_rgba(79,70,229,0.4)] animate-pulse">
                {gamificationStats.level}
              </div>
              <div>
                <h3 className="font-semibold">Level {gamificationStats.level}</h3>
                <div className="text-sm text-gray-600">{gamificationStats.points} / {gamificationStats.nextLevelPoints} XP</div>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/gamification')}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all hover:scale-105 border border-white/20 relative overflow-hidden group"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[200%] transition-all duration-1000"></span>
              View Achievements
            </Button>
          </div>
          <Progress value={progressToNextLevel} className="h-2 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
          </Progress>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Current: Level {gamificationStats.level}</span>
            <span>Next: Level {gamificationStats.level + 1}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm text-gray-500">Total Videos</h4>
            <p className="text-3xl font-bold text-blue-600">
              {isLoading ? "..." : userStats.videosByStatus.total}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm text-gray-500">Completed</h4>
            <p className="text-3xl font-bold text-green-600">
              {isLoading ? "..." : userStats.videosByStatus.completed}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm text-gray-500">In Progress</h4>
            <p className="text-3xl font-bold text-yellow-600">
              {isLoading
                ? "..."
                : userStats.videosByStatus.pending +
                  userStats.videosByStatus.processing}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm text-gray-500">Total Minutes</h4>
            <p className="text-3xl font-bold text-purple-600">
              {isLoading ? "..." : userStats.totalDuration}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Challenge and Daily Tasks Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="text-xl font-bold">Daily Challenges</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{challenge.title}</h3>
                    <Badge className="bg-indigo-100 text-indigo-700">
                      +{challenge.points} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress: {challenge.progress}/{challenge.total}</span>
                      <span>{challenge.daysLeft} days left</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.total) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all hover:scale-105 border border-white/20 mt-2 relative overflow-hidden group"
                onClick={() => router.push('/gamification')}
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[200%] transition-all duration-1000"></span>
                View All Challenges
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Activity Timeline</h2>
            </CardHeader>
            <CardContent>
              {userStats.dailyActivity.length > 0 ? (
                <Line
                  data={listeningData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-10">
                  No activity data available
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Language Breakdown</h2>
            </CardHeader>
            <CardContent>
              {userStats.languageBreakdown.length > 0 ? (
                <Doughnut
                  data={activityData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-10">
                  No language data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Accomplishments */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Recent Accomplishments</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {gamificationStats.badges.length > 0 ? (
              gamificationStats.badges.map(badge => (
                <div key={badge.id} className="text-center w-24">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <span className="text-3xl">{badge.emoji}</span>
                  </div>
                  <h3 className="text-sm font-medium">{badge.name}</h3>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6 w-full">
                Complete activities to earn badges and achievements!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Video Form */}
      <Card className="border-t-4 border-t-indigo-500">
        <CardHeader>
          <h2 className="text-xl font-bold text-center">Create Content</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Educational Content
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your educational content here..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Avatar</label>
                <select
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="default">Default Teacher</option>
                  <option value="business">Business Professional</option>
                  <option value="casual">Casual Teacher</option>
                  <option value="custom">Custom Avatar</option>
                </select>
              </div>
            </div>

            {avatar === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Custom Avatar
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear portrait photo for best results
                </p>
              </div>
            )}

            {/* Centered action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6 mt-8">
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 via-purple-700 to-violet-800 text-white hover:from-indigo-700 hover:via-purple-800 hover:to-violet-900 py-6 px-10 text-lg font-bold shadow-[0_0_20px_rgba(79,70,229,0.6)] rounded-xl transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.8)] hover:scale-105 border-2 border-white/20 relative overflow-hidden group"
                disabled={loading || !text.trim()}
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[200%] transition-all duration-1000"></span>
                <span className="flex items-center">
                  <span className="mr-3 text-2xl animate-bounce">🎬</span>
                  {loading ? "Creating Video..." : "Create Educational Video"}
                </span>
              </Button>
              
              <Button
                type="button"
                className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-600 text-white hover:from-violet-800 hover:via-purple-800 hover:to-indigo-700 py-6 px-10 text-lg font-bold shadow-[0_0_20px_rgba(124,58,237,0.6)] rounded-xl transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.8)] hover:scale-105 border-2 border-white/20 relative overflow-hidden group"
                disabled={loading || !text.trim()}
                onClick={async () => {
                  if (!text.trim()) {
                    return;
                  }

                  try {
                    setLoading(true);
                    setError("");

                    // Show loading toast
                    const loadingToast = toast.loading("Generating quiz... This may take a minute.");

                    // Call quiz generation API directly with content
                    const response = await fetch("/api/quiz/generate", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        content: text,
                        title: `Quiz on ${new Date().toLocaleDateString()}`,
                        difficulty: "medium",
                      }),
                    });

                    toast.dismiss(loadingToast);
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      let errorMessage = "Failed to generate quiz";
                      let errorData = {};
                      
                      // Try to parse the error response as JSON
                      try {
                        errorData = JSON.parse(errorText);
                        errorMessage = errorData.error || errorMessage;
                        if (errorData.details) {
                          console.error("Error details:", errorData.details);
                        }
                      } catch (parseError) {
                        // If it's not valid JSON, log the raw response
                        console.error("Invalid JSON in error response:", errorText);
                      }
                      
                      console.error("Quiz generation error:", errorMessage);
                      toast.error(errorMessage);
                      throw new Error(errorMessage);
                    }
                    
                    const responseText = await response.text();
                    let data;
                    
                    try {
                      data = JSON.parse(responseText);
                    } catch (parseError) {
                      console.error("Error parsing success response:", parseError);
                      console.log("Raw response:", responseText);
                      toast.error("Received invalid response format");
                      setLoading(false);
                      return;
                    }
                    
                    toast.success("Quiz generated successfully!");
                    
                    router.push(`/quiz/${data.quiz.id}`);
                  } catch (error) {
                    console.error("Error generating quiz:", error);
                    toast.error(error.message || "Failed to generate quiz. Please try again.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[200%] transition-all duration-1000"></span>
                <span className="flex items-center">
                  <span className="mr-3 text-2xl animate-pulse">🧠</span>
                  Generate Quiz Only
                </span>
              </Button>
            </div>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
