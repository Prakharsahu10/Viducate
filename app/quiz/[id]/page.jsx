"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export default function QuizPage({ params }) {
  const router = useRouter();
  const quizId = params.id;
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch(`/api/quiz/${quizId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }
        
        const data = await response.json();
        setQuiz(data.quiz);
        setSelectedOptions(new Array(data.quiz.questions.length).fill(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuiz();
  }, [quizId]);
  
  // Handle answer selection
  const handleSelectOption = (questionIndex, optionIndex) => {
    if (quizCompleted) return;
    
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Move to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Submit quiz
  const handleSubmitQuiz = async () => {
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedOptions[index] === question.correctOption) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    
    // Submit result to API
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          score: finalScore,
          maxScore: 100,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }
      
      setQuizCompleted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested quiz could not be found.</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (quizCompleted) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
            <CardDescription className="text-center">
              {quiz.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full mb-4">
                <span className="text-5xl font-bold text-gradient bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  {score}%
                </span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">
                {score >= 80 ? "Great job! 🎉" : score >= 60 ? "Good effort! 👍" : "Keep learning! 📚"}
              </h3>
              
              <p className="text-gray-600">
                You answered {quiz.questions.filter((_, i) => selectedOptions[i] === quiz.questions[i].correctOption).length} out of {quiz.questions.length} questions correctly.
              </p>
            </div>
            
            <div className="space-y-4 mt-8">
              <h3 className="font-semibold text-lg">Question Review:</h3>
              
              {quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    {selectedOptions[qIndex] === question.correctOption ? (
                      <CheckCircle className="text-green-500 h-5 w-5 mt-1" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5 mt-1" />
                    )}
                    <div>
                      <p className="font-medium">{question.text}</p>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, oIndex) => (
                          <div 
                            key={oIndex} 
                            className={`px-3 py-2 rounded ${
                              question.correctOption === oIndex 
                                ? "bg-green-100 border border-green-300" 
                                : selectedOptions[qIndex] === oIndex && selectedOptions[qIndex] !== question.correctOption
                                ? "bg-red-100 border border-red-300"
                                : "bg-gray-50"
                            }`}
                          >
                            {option}
                            {question.correctOption === oIndex && 
                              <span className="ml-2 text-green-600 text-sm">(Correct answer)</span>
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentQuestionData = quiz.questions[currentQuestion];
  
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestionData.text}</h3>
            
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedOptions[currentQuestion] === index
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                  onClick={() => handleSelectOption(currentQuestion, index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button 
                onClick={handleSubmitQuiz}
                disabled={selectedOptions.includes(null)}
                className="bg-gradient-to-br from-blue-600 to-purple-600 text-white"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                disabled={selectedOptions[currentQuestion] === null}
              >
                Next
              </Button>
            )}
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="flex gap-1">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    selectedOptions[index] !== null
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  } ${currentQuestion === index ? "ring-2 ring-blue-300" : ""}`}
                  onClick={() => setCurrentQuestion(index)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 