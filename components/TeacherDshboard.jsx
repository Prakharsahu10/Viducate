// components/TeacherDashboard.tsx
"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const studentProgressData = {
  labels: ["Math", "Science", "English"],
  datasets: [
    {
      label: "Average Completion (%)",
      data: [78, 92, 65],
      backgroundColor: ["#6366F1", "#EC4899", "#FBBF24"],
    },
  ],
};

const activityTrendData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Avg Learning Minutes",
      data: [120, 150, 170, 200],
      fill: true,
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      borderColor: "#6366F1",
      tension: 0.4,
    },
  ],
};

const courses = [
  { title: "Algebra Basics", status: "Published", students: 28 },
  { title: "Intro to Physics", status: "Draft", students: 14 },
  { title: "World History", status: "Published", students: 35 },
];

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
        👩‍🏫 Teacher Dashboard
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Student Course Completion</h3>
          </CardHeader>
          <CardContent>
            <Doughnut data={studentProgressData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Learning Activity Over Time
            </h3>
          </CardHeader>
          <CardContent>
            <Line data={activityTrendData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Your Courses</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <TableRow key={index}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.status}</TableCell>
                  <TableCell>{course.students}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Create New Course</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Course Title" />
          <Textarea placeholder="Course Description" rows={4} />
          <Button className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-full">
            Save Course
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
