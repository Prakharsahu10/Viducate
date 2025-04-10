"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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

export function VideoPage() {
  const params = useParams();
  const videoId = params.id;

  // Create a simple video status component
  const [status, setStatus] = useState("pending");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
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
        const logMessage = `Poll #${pollCount + 1} at ${timestamp} (${(
          pollInterval / 1000
        ).toFixed(1)}s interval)`;
        console.log(logMessage);

        if (mounted) {
          setApiCalls((prev) => [...prev, logMessage]);
        }

        // Get the talk_id from localStorage
        const talkId = localStorage.getItem(`talk_id_${videoId}`);
        if (!talkId) {
          throw new Error("Missing talk ID for this video");
        }

        // Use our status API to check the video
        const response = await fetch(
          `/api/d-id/status/${videoId}?talk_id=${talkId}`,
          {
            signal: controller.signal,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit hit, wait longer and try again
            const retryMessage = `Rate limit hit. Waiting longer to retry...`;
            console.log(retryMessage);
            if (mounted) {
              setApiCalls((prev) => [...prev, retryMessage]);
              setPollCount((prev) => prev + 2); // Skip ahead in backoff
            }

            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(checkStatus, 60000); // Wait longer (1 minute)
            return;
          }
          throw new Error(
            `Failed to fetch video status: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (!mounted) return;

        setStatus(data.status);

        if (data.status === "completed") {
          setVideoUrl(data.video_url);
          setLoading(false);
          // Add final success message
          const successMessage = `✅ Video is ready! (${new Date().toLocaleTimeString()})`;
          setApiCalls((prev) => [...prev, successMessage]);

          // The video is already saved in the database by the status API
          setApiCalls((prev) => [
            ...prev,
            `💾 Video saved to database with ID: ${videoId}`,
          ]);
        } else {
          // Increment poll count to increase interval for next poll
          setPollCount((prev) => prev + 1);

          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Set new timeout with increased interval
          timeoutRef.current = setTimeout(checkStatus, pollInterval);

          // Add status update
          const statusMessage = `Current status: ${data.status}`;
          setApiCalls((prev) => [...prev, statusMessage]);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }

        if (!mounted) return;

        setError(`Failed to check video status: ${err.message}`);
        setLoading(false);
        console.error(err);

        // Add error message
        const errorMessage = `❌ Error: ${err.message}`;
        setApiCalls((prev) => [...prev, errorMessage]);
      }
    };

    if (videoId) {
      // Initial message
      setApiCalls([
        `Starting status checks for video ID: ${videoId} (${new Date().toLocaleTimeString()})`,
      ]);
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
  }, [videoId, pollCount]);

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
              onClick={() => router.push("/dashboard")}
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
            <video controls className="w-full rounded-lg shadow" src={videoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => router.push("/dashboard")}
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
