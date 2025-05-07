import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { QuestionResult, TeamAnswerResult } from "@/types";
import { motion } from "framer-motion";

const AnswerResults: React.FC = () => {
  const [match, params] = useRoute("/results/:sessionId/:questionId");
  const sessionId = params?.sessionId;
  const questionId = params?.questionId;
  const [, navigate] = useLocation();
  const socket = useSocket();
  
  const [results, setResults] = useState<QuestionResult | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    if (!sessionId || !questionId || !socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "QUESTION_RESULTS":
            if (data.payload.sessionId === sessionId && data.payload.questionId === questionId) {
              setResults(data.payload);
              setIsOrganizer(data.payload.isOrganizer);
            }
            break;
          case "NEXT_QUESTION":
            if (data.payload.sessionId === sessionId) {
              navigate(`/quiz/${sessionId}`);
            }
            break;
          case "QUIZ_ENDED":
            if (data.payload.sessionId === sessionId) {
              navigate(`/final/${sessionId}`);
            }
            break;
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.addEventListener("message", handleMessage);

    // Request results for this question
    socket.send(JSON.stringify({
      type: "GET_QUESTION_RESULTS",
      payload: { sessionId, questionId }
    }));

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [sessionId, questionId, socket, navigate]);

  const handleNextQuestion = () => {
    if (!socket || !sessionId || !questionId) return;
    
    socket.send(JSON.stringify({
      type: "REQUEST_NEXT_QUESTION",
      payload: { sessionId }
    }));
  };

  if (!results) {
    return <div className="text-center p-8">Chargement des résultats...</div>;
  }

  return (
    <section id="answer-results">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-eco-primary text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-heading font-semibold">Résultats de la question</h2>
            <div className="bg-white text-eco-primary px-3 py-1 rounded-full text-sm font-bold">
              Question <span>{results.questionIndex + 1}</span>/<span>{results.totalQuestions}</span>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-6 md:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-heading font-bold text-eco-dark mb-4">
              {results.question.text}
            </h3>
            
            {/* Correct Answer */}
            <div className="bg-eco-correct bg-opacity-10 border-l-4 border-eco-correct rounded-r p-4 mb-6">
              <div className="flex items-start">
                <div className="bg-eco-correct rounded-full w-8 h-8 flex items-center justify-center text-white mr-3">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <p className="font-heading font-semibold text-lg">
                    Réponse correcte: {results.correctAnswerLetter} - {results.correctAnswer.text}
                  </p>
                  {results.correctAnswer.explanation && (
                    <p className="text-gray-700 mt-2">
                      {results.correctAnswer.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Team Results */}
            <div className="bg-eco-light rounded-lg p-4">
              <h4 className="font-heading font-semibold text-lg mb-3">Résultats par équipe</h4>
              
              <div className="space-y-3">
                {results.teamResults.map((teamResult: TeamAnswerResult) => (
                  <div className="flex items-center justify-between bg-white p-3 rounded shadow-sm" key={teamResult.teamId}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${teamResult.teamColor} rounded-full mr-3 flex items-center justify-center text-white font-bold`}>
                        {teamResult.ranking}
                      </div>
                      <span className="font-medium">Équipe {teamResult.teamName}</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`${teamResult.isCorrect ? 'bg-eco-correct' : 'bg-eco-incorrect'} text-white rounded-full px-3 py-1 text-sm font-bold mr-2`}>
                        <i className={`fas ${teamResult.isCorrect ? 'fa-check' : 'fa-times'} mr-1`}></i> 
                        {teamResult.isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                      <span className="font-bold">{teamResult.isCorrect ? `+${teamResult.pointsEarned}` : '+0'} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mb-8">
            <h4 className="font-heading font-semibold text-lg mb-3">Statistiques de réponse</h4>
            
            <div className="bg-eco-light p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {results.answerStats.map((stat, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  const isCorrect = letter === results.correctAnswerLetter;
                  
                  return (
                    <div 
                      className={`bg-white rounded p-3 text-center ${isCorrect ? 'border-2 border-eco-correct' : ''}`}
                      key={letter}
                    >
                      <div className={`${isCorrect ? 'text-eco-correct' : 'text-gray-600'} text-sm ${isCorrect ? 'font-semibold' : ''} mb-1`}>
                        Réponse {letter}
                      </div>
                      <div className="font-bold text-lg">{stat.percentage}%</div>
                      <div className="text-sm">{stat.text}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center bg-white p-3 rounded">
                <div>Équipes ayant répondu correctement :</div>
                <div className="font-bold text-eco-correct">{results.percentCorrect}%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            {isOrganizer ? (
              <Button
                className="bg-eco-primary hover:bg-eco-primary-dark text-white font-bold py-3 px-8 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:ring-opacity-50 shadow"
                onClick={handleNextQuestion}
              >
                {results.isLastQuestion ? 'Voir les résultats finaux' : 'Question suivante'} <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            ) : (
              <div className="p-4 bg-eco-light rounded text-center">
                <p>En attente du passage à la {results.isLastQuestion ? 'page de résultats' : 'question suivante'}...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnswerResults;
