"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import TeacherDashboard from "@/components/TeacherDshboard";


import { useParams } from 'react-router-dom';
import VideoStatus from '@/components/VideoStatus';

export default function VideoPage() {
  const { id: videoId } = useParams<{ id: string }>();

  return <VideoStatus videoId={videoId} />;
}



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

// Dummy Listening Time (Line Chart)
const listeningData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      label: "Minutes Listened",
      data: [20, 35, 45, 30, 60],
      fill: true,
      backgroundColor: "rgba(99, 102, 241, 0.2)", // Blue-500 with opacity
      borderColor: "#6366F1", // Blue-500
      tension: 0.4,
    },
  ],
};

// Dummy Learning Activity (Doughnut Chart)
const activityData = {
  labels: ["Math", "Science", "History"],
  datasets: [
    {
      label: "Courses",
      data: [12, 19, 8],
      backgroundColor: [
        "#6366F1", // Indigo-500
        "#EC4899", // Pink-500
        "#FBBF24", // Yellow-400
      ],
    },
  ],
};

export default function DashboardPage() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [avatar, setAvatar] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customAvatar, setCustomAvatar] = useState(null);
  
  const router = useRouter();
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('text', text);
      formData.append('language', language);
      formData.append('avatar', avatar);
      
      if (customAvatar) {
        formData.append('custom_avatar', customAvatar);
      }
      
      // Ye backend request bheja hai
      const response = await fetch('http://localhost:8000/generate-video/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate video');
      }
      
      const data = await response.json();
      
      // Status Page
      router.push(`/videos/${data.id}`);
    } catch (err) {
      setError('Failed to generate video. Please try again.');
      console.error(err);
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
    <div className="px-6 py-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Welcome!
        </h1>
        <p className="text-gray-500">
          Explore your learning journey and create powerful AI videos.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="mx-auto justify-center">
          <TabsTrigger value="student">Student Dashboard</TabsTrigger>
          <TabsTrigger value="teacher">Teacher Dashboard</TabsTrigger>
        </TabsList>

        {/* Student Dashboard */}
        <TabsContent value="student" className="space-y-10">
          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Listening Time</h3>
              </CardHeader>
              <CardContent>
                <Line data={listeningData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Learning Activity</h3>
              </CardHeader>
              <CardContent>
                <Doughnut data={activityData} />
              </CardContent>
            </Card>
          </div>

          {/* AI Video Form */}
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
                <div className="p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <Textarea 
                    placeholder="Enter lesson content here..." 
                    rows={5} 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm mb-1 block">Language</label>
                      <select 
                        className="w-full h-10 px-3 py-2 border rounded-md"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
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
                    {loading ? 'Generating...' : 'Generate Video'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teacher Dashboard (Placeholder) */}
        <TabsContent value="teacher">
          <div className="text-center text-gray-500 py-10">
            <TeacherDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
