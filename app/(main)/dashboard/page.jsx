"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [avatar, setAvatar] = useState("default");
  const [loading, setLoading] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(null);

  const router = useRouter();
  const fileInputRef = useRef(null);

  // Add useEffect to fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch user statistics");
        }

        const data = await response.json();
        setUserStats(
          data.stats || {
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
      } catch (err) {
        console.error("Error fetching user statistics:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
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

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Watching Time (Last 7 Days)
            </h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-red-500">Failed to load data</p>
              </div>
            ) : (
              <Line
                data={listeningData}
                options={{ maintainAspectRatio: false }}
                className="h-64"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Videos by Language</h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-red-500">Failed to load data</p>
              </div>
            ) : userStats.languageBreakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No videos created yet</p>
              </div>
            ) : (
              <Doughnut
                data={activityData}
                options={{ maintainAspectRatio: false }}
                className="h-64"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Creation Form */}
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-2xl font-bold text-gradient bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
            🎥 Create Educational Video
          </h2>
          <p className="text-muted-foreground text-sm">
            Convert your lessons into videos using AI avatars.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="text-sm mb-1 block">Content</label>
                <Textarea
                  placeholder="Enter your content in the language you select below..."
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Important: Please write your text in the language you select
                  below. The avatar will speak in that language.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 block">Language</label>
                  <select
                    className="w-full h-10 px-3 py-2 border rounded-md"
                    value={language}
                    onChange={(e) => {
                      console.log("Language changed to:", e.target.value);
                      setLanguage(e.target.value);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="hi">Hindi</option>
                    <option value="fr">French</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    The avatar will speak in this language. Your text must be
                    written in this language.
                  </p>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Avatar</label>
                  <select
                    className="w-full h-10 px-3 py-2 border rounded-md"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="rian">Rian</option>
                    <option value="anna">Anna</option>
                    <option value="daniel">Daniel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm mb-1 block">
                  Upload Custom Avatar
                </label>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear front-facing photo for best results.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all duration-300"
              >
                {loading ? "Generating..." : "Generate Video"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
