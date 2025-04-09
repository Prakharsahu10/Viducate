"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from 'next/navigation';
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

export function VideoPage() {
  const params = useParams();
  const videoId = params.id;

  // Create a simple video status component
  const [status, setStatus] = useState('pending');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [apiCalls, setApiCalls] = useState([]);
  
  const router = useRouter();
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    
    const checkStatus = async () => {
      try {
        // Use exponential backoff strategy with jitter
        // Start at 5 seconds for first poll, then increase exponentially
        // Base: 5s, 10s, 20s, 40s, etc. up to max of 2 minutes
        const baseInterval = Math.min(5000 * Math.pow(2, pollCount), 120000);
        // Add some random jitter (±10% of base interval) to avoid synchronized polling
        const jitter = Math.floor(baseInterval * 0.1 * (Math.random() * 2 - 1));
        const pollInterval = baseInterval + jitter;
        
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `Poll #${pollCount+1} at ${timestamp} (${(pollInterval/1000).toFixed(1)}s interval)`;
        console.log(logMessage);
        
        if (mounted) {
          setApiCalls(prev => [...prev, logMessage]);
        }
        
        const response = await fetch(`http://localhost:8000/video-status/${videoId}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit hit, wait longer and try again
            const retryMessage = `Rate limit hit. Waiting longer to retry...`;
            console.log(retryMessage);
            if (mounted) {
              setApiCalls(prev => [...prev, retryMessage]);
              setPollCount(prev => prev + 2); // Skip ahead in backoff
            }
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(checkStatus, 60000); // Wait longer (1 minute)
            return;
          }
          throw new Error(`Failed to fetch video status: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!mounted) return;
        
        setStatus(data.status);
        
        if (data.status === 'completed') {
          setVideoUrl(data.video_url);
          setLoading(false);
          // Add final success message
          const successMessage = `✅ Video is ready! (${new Date().toLocaleTimeString()})`;
          setApiCalls(prev => [...prev, successMessage]);
        } else {
          // Increment poll count to increase interval for next poll
          setPollCount(prev => prev + 1);
          
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set new timeout with increased interval
          timeoutRef.current = setTimeout(checkStatus, pollInterval);
          
          // Add status update
          const statusMessage = `Current status: ${data.status}`;
          setApiCalls(prev => [...prev, statusMessage]);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        
        if (!mounted) return;
        
        setError(`Failed to check video status: ${err.message}`);
        setLoading(false);
        console.error(err);
        
        // Add error message
        const errorMessage = `❌ Error: ${err.message}`;
        setApiCalls(prev => [...prev, errorMessage]);
      }
    };
    
    if (videoId) {
      // Initial message
      setApiCalls([`Starting status checks for video ID: ${videoId} (${new Date().toLocaleTimeString()})`]);
      // Delay the first check by 5 seconds
      timeoutRef.current = setTimeout(checkStatus, 5000);
    }
    
    // Clean up function to prevent memory leaks and abort pending requests
    return () => {
      mounted = false;
      controller.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoId]);
  
  if (loading) {
    return (
      <div className="px-6 py-10 max-w-7xl mx-auto space-y-10">
        <Card>
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-gradient bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Generating Your Video
            </h2>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500">
              This may take a few minutes. Please wait...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-6 py-10 max-w-7xl mx-auto space-y-10">
        <Card>
          <CardHeader className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
          </CardHeader>
          <CardContent className="space-y-5 text-center">
            <p className="text-gray-500">{error}</p>
            <Button 
              className="bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all duration-300"
              onClick={() => router.push('/dashboard')}
            >
              Go back and try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-10 max-w-7xl mx-auto space-y-10">
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-2xl font-bold text-gradient bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Your Video is Ready!
          </h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="mb-6">
            <video 
              controls 
              className="w-full rounded-lg shadow"
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              className="text-blue-600 hover:text-blue-700"
              onClick={() => router.push('/dashboard')}
            >
              Create Another Video
            </Button>
            
            <a 
              href={videoUrl} 
              download 
              className="px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-all duration-300"
            >
              Download Video
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return <VideoPage />;
}

export function DashboardPage() {
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
      
      console.log('Submitting with language:', language);
      
      // Send request to backend
      const response = await fetch('http://localhost:8000/generate-video/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate video');
      }
      
      const data = await response.json();
      
      // Navigate to status page
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
                      Important: Please write your text in the language you select below. The avatar will speak in that language.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm mb-1 block">Language</label>
                      <select 
                        className="w-full h-10 px-3 py-2 border rounded-md"
                        value={language}
                        onChange={(e) => {
                          console.log('Language changed to:', e.target.value);
                          setLanguage(e.target.value);
                        }}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="hi">Hindi</option>
                        <option value="fr">French</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        The avatar will speak in this language. Your text must be written in this language.
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
