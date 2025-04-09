import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={`p-6 border-b ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant, className, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-300";
  const variantClasses = variant === "outline" 
    ? "border border-current bg-transparent" 
    : "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90";
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

function VideoStatus({ videoId }) {
  const [status, setStatus] = useState('pending');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/video-status/${videoId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch video status');
        }
        
        const data = await response.json();
        
        setStatus(data.status);
        
        if (data.status === 'completed') {
          setVideoUrl(data.video_url);
          setLoading(false);
        } else {
          // Check again after 5 seconds
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        setError('Failed to check video status');
        setLoading(false);
        console.error(err);
      }
    };
    
    checkStatus();
    
    // Cleanup function
    return () => {
      // Clear any timeouts if component unmounts
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
            <Link to="/">
              <Button className="bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all duration-300">
                Go back and try again
              </Button>
            </Link>
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
            <Link to="/">
              <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                Create Another Video
              </Button>
            </Link>
            
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

export default VideoStatus;
