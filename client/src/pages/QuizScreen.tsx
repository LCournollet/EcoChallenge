import React, { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useSocket } from "@/hooks/useSocket";
import { Question, QuizState, TeamRanking, Answer } from "@/types";
import { motion } from "framer-motion";

const QuizScreen: React.FC = () => {
  const [match, params] = useRoute("/quiz/:sessionId");
  const socket = useSocket();
  const sessionId = params?.sessionId;
  
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(20);
  const [teamRankings, setTeamRankings] = useState<TeamRanking[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId || !socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "QUIZ_STATE_UPDATE":
            if (data.payload.sessionId === sessionId) {
              setQuizState(data.payload);
              setCurrentQuestion(data.payload.currentQuestion);
              setRemainingTime(data.payload.timeRemaining);
              setTeamRankings(data.payload.teamRankings);
              setIsAnswerSubmitted(false);
              setSelectedAnswer(null);
              
              // Reset timer animation
              if (timerBarRef.current) {
                timerBarRef.current.style.width = '100%';
                setTimeout(() => {
                  if (timerBarRef.current) {
                    timerBarRef.current.style.width = '0%';
                  }
                }, 100);
              }
            }
            break;
          case "SHOW_ANSWER":
            if (data.payload.sessionId === sessionId) {
              // Navigate to the answer results page handled in App.tsx with socket listener
            }
            break;
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.addEventListener("message", handleMessage);

    // Request current quiz state
    socket.send(JSON.stringify({
      type: "GET_QUIZ_STATE",
      payload: { sessionId }
    }));

    // Start timer countdown
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      socket.removeEventListener("message", handleMessage);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionId, socket]);

  const handleAnswerSelect = (answerLetter: string) => {
    if (isAnswerSubmitted || remainingTime <= 0) return;
    
    setSelectedAnswer(answerLetter);
    setIsAnswerSubmitted(true);
    
    if (socket && sessionId && currentQuestion) {
      socket.send(JSON.stringify({
        type: "SUBMIT_ANSWER",
        payload: {
          sessionId,
          questionId: currentQuestion.id,
          answer: answerLetter
        }
      }));
    }
  };

  if (!quizState || !currentQuestion) {
    return <div className="text-center p-8">Chargement du quiz...</div>;
  }

  return (
    <section id="quiz-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-eco-primary text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-heading font-semibold">EcoTeam Challenge: <span>{quizState.sessionName}</span></h2>
            </div>
            <div className="flex items-center">
              <div className="mr-6">
                <span className="font-bold">{quizState.currentQuestionIndex + 1}</span>
                <span>/</span>
                <span>{quizState.totalQuestions}</span>
              </div>
              <div className="bg-white text-eco-primary px-3 py-1 rounded-full text-sm font-bold">
                <i className="fas fa-users mr-1"></i> {quizState.teamCount} équipes
              </div>
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="bg-eco-primary-dark text-white h-2">
          <div 
            ref={timerBarRef}
            className="timer-progress bg-eco-secondary h-full" 
            style={{ width: `${(remainingTime / 20) * 100}%` }}
          ></div>
        </div>
        
        {/* Question Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 md:p-8 question-enter"
        >
          {currentQuestion.imageUrl && (
            <div 
              className="rounded-xl overflow-hidden mb-6 h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url('${currentQuestion.imageUrl}')` }}
            ></div>
          )}
          
          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-eco-dark mb-2">
              {currentQuestion.text}
            </h3>
            <div className="text-sm text-gray-500">
              <i className="fas fa-clock mr-1"></i> {remainingTime} secondes pour répondre
            </div>
          </div>
          
          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {currentQuestion.answers.map((answer: Answer, index: number) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              return (
                <button 
                  key={letter}
                  className={`answer-btn bg-white hover:bg-gray-100 text-eco-dark text-left p-4 rounded-lg border-2 
                    ${selectedAnswer === letter ? 'border-eco-primary bg-eco-primary bg-opacity-10' : 'border-gray-200 hover:border-eco-primary'} 
                    transition duration-200 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:ring-opacity-50`}
                  onClick={() => handleAnswerSelect(letter)}
                  disabled={isAnswerSubmitted || remainingTime <= 0}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-eco-primary text-white flex items-center justify-center font-bold mr-3">{letter}</div>
                    <span className="text-lg">{answer.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Current Standings (Minimized during questions) */}
          <div className="mt-8 pt-6 border-t">
            <details open={showRankings}>
              <summary 
                className="font-heading font-semibold text-eco-primary cursor-pointer"
                onClick={() => setShowRankings(!showRankings)}
              >
                Voir le classement actuel
              </summary>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {teamRankings.map((team, index) => (
                  <div className="border rounded p-3 flex items-center" key={team.id}>
                    <div className={`w-8 h-8 team-color-${index+1} rounded-full mr-2 flex items-center justify-center text-white font-bold`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">Équipe {team.name}</div>
                      <div className="text-lg font-bold">{team.score} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuizScreen;
