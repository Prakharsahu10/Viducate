"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PulseLoader } from "react-spinners";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState("weekly");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        
        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [timeframe]);

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
  };

  // Sample data if the API isn't implemented yet
  const sampleLeaderboardData = [
    { 
      id: 1, 
      name: "Alex Johnson", 
      imageUrl: "https://i.pravatar.cc/100?img=1", 
      points: 1250, 
      level: 12, 
      rank: 1 
    },
    { 
      id: 2, 
      name: "Maya Patel", 
      imageUrl: "https://i.pravatar.cc/100?img=2", 
      points: 980, 
      level: 10, 
      rank: 2 
    },
    { 
      id: 3, 
      name: "Sam Wilson", 
      imageUrl: "https://i.pravatar.cc/100?img=3", 
      points: 850, 
      level: 9, 
      rank: 3 
    },
    { 
      id: 4, 
      name: "Taylor Swift", 
      imageUrl: "https://i.pravatar.cc/100?img=4", 
      points: 720, 
      level: 8, 
      rank: 4 
    },
    { 
      id: 5, 
      name: "Jamie Lee", 
      imageUrl: "https://i.pravatar.cc/100?img=5", 
      points: 690, 
      level: 7, 
      rank: 5 
    },
    { 
      id: 6, 
      name: "Chris Evans", 
      imageUrl: "https://i.pravatar.cc/100?img=6", 
      points: 590, 
      level: 6, 
      rank: 6 
    },
    { 
      id: 7, 
      name: "Morgan Freeman", 
      imageUrl: "https://i.pravatar.cc/100?img=7", 
      points: 530, 
      level: 6, 
      rank: 7 
    },
    { 
      id: 8, 
      name: "Emma Stone", 
      imageUrl: "https://i.pravatar.cc/100?img=8", 
      points: 490, 
      level: 5, 
      rank: 8 
    },
    { 
      id: 9, 
      name: "Robert Downey", 
      imageUrl: "https://i.pravatar.cc/100?img=9", 
      points: 450, 
      level: 5, 
      rank: 9 
    },
    { 
      id: 10, 
      name: "Zoe Saldana", 
      imageUrl: "https://i.pravatar.cc/100?img=10", 
      points: 420, 
      level: 5, 
      rank: 10 
    },
  ];

  // Use sample data if the API returns empty data
  const displayData = leaderboardData.length > 0 ? leaderboardData : sampleLeaderboardData;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center text-indigo-700">
          🏆 Leaderboard
        </CardTitle>
        <Tabs defaultValue="weekly" onValueChange={handleTimeframeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <PulseLoader color="#6366F1" size={10} />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto pr-4">
            <div className="space-y-2">
              {displayData.map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    index < 3 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-amber-400 text-white' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    <span className="text-sm font-bold">{user.rank || index + 1}</span>
                  </div>
                  
                  {/* User Image */}
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={user.imageUrl || 'https://i.pravatar.cc/100'} 
                      alt={user.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    <div className="flex items-center">
                      <Badge className="bg-indigo-100 text-indigo-700 mr-2">
                        Level {user.level}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {user.points} XP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard; 