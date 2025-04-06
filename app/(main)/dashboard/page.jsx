"use client";

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

export default function DashboardPage() {
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
              <Textarea placeholder="Enter lesson content here..." rows={5} />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 block">Language</label>
                  <Input type="text" placeholder="English" />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Avatar</label>
                  <Input type="text" placeholder="Default" />
                </div>
              </div>

              <div>
                <label className="text-sm mb-1 block">
                  Upload Custom Avatar
                </label>
                <Input type="file" />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a clear front-facing photo for best results.
                </p>
              </div>

              <Button className="w-full bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all duration-300">
                Generate Video
              </Button>
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
