import React, { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { FinalResultsData, TeamFinalResult, DifficultQuestion } from "@/types";
import { motion } from "framer-motion";

const FinalResults: React.FC = () => {
  const [match, params] = useRoute("/final/:sessionId");
  const sessionId = params?.sessionId;
  const [, navigate] = useLocation();
  const socket = useSocket();
  
  const [results, setResults] = useState<FinalResultsData | null>(null);

  useEffect(() => {
    if (!sessionId || !socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "FINAL_RESULTS" && data.payload.sessionId === sessionId) {
          setResults(data.payload);
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.addEventListener("message", handleMessage);

    // Request final results
    socket.send(JSON.stringify({
      type: "GET_FINAL_RESULTS",
      payload: { sessionId }
    }));

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [sessionId, socket]);

  const handleNewGame = () => {
    navigate("/");
  };

  if (!results) {
    return <div className="text-center p-8">Chargement des résultats finaux...</div>;
  }

  // Sort teams by rank
  const podiumTeams = [...results.teams]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);
  
  const otherTeams = [...results.teams]
    .sort((a, b) => a.rank - b.rank)
    .slice(3);

  return (
    <section id="final-results">
      <div className="max-w-5xl mx-auto">
        {/* Podium Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="bg-eco-primary text-white p-6">
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold mb-2">Fin du Quiz!</h2>
              <p className="text-lg">Voici les résultats pour la session <span>{results.sessionName}</span></p>
            </div>
          </div>
          
          <div 
            className="h-48 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400')" }}
          ></div>
          
          <div className="p-6 md:p-8">
            <h3 className="text-2xl font-heading font-bold text-center text-eco-dark mb-8">Podium</h3>
            
            <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-10">
              {podiumTeams.map((team, index) => {
                // Determine which position to render
                if (team.rank === 2) {
                  // 2nd Place
                  return (
                    <div key={team.id} className="order-2 md:order-1 flex flex-col items-center">
                      <div className="team-color-2 text-white w-12 h-12 rounded-full mb-2 flex items-center justify-center font-bold text-xl">2</div>
                      <div className="bg-gray-100 rounded-t-lg w-32 p-4 text-center h-32 flex flex-col items-center justify-center">
                        <div className="text-xl font-bold">{team.score} pts</div>
                        <div className="font-heading font-medium">Équipe {team.name}</div>
                      </div>
                    </div>
                  );
                } else if (team.rank === 1) {
                  // 1st Place
                  return (
                    <div key={team.id} className="order-1 md:order-2 flex flex-col items-center">
                      <div className="team-color-1 text-white w-14 h-14 rounded-full mb-2 flex items-center justify-center font-bold text-2xl">1</div>
                      <div className="bg-eco-secondary bg-opacity-20 rounded-t-lg w-36 p-4 text-center h-40 flex flex-col items-center justify-center border-t-4 border-eco-secondary">
                        <div className="text-2xl font-bold">{team.score} pts</div>
                        <div className="font-heading font-semibold text-lg">Équipe {team.name}</div>
                        <div className="mt-2">
                          <i className="fas fa-trophy text-yellow-500 text-2xl"></i>
                        </div>
                      </div>
                    </div>
                  );
                } else if (team.rank === 3) {
                  // 3rd Place
                  return (
                    <div key={team.id} className="order-3 flex flex-col items-center">
                      <div className="team-color-3 text-white w-12 h-12 rounded-full mb-2 flex items-center justify-center font-bold text-xl">3</div>
                      <div className="bg-gray-100 rounded-t-lg w-32 p-4 text-center h-28 flex flex-col items-center justify-center">
                        <div className="text-xl font-bold">{team.score} pts</div>
                        <div className="font-heading font-medium">Équipe {team.name}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            
            {/* Other Teams */}
            {otherTeams.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h4 className="font-heading font-semibold text-lg mb-4">Autres équipes</h4>
                
                <div className="space-y-3">
                  {otherTeams.map((team) => (
                    <div className="flex items-center justify-between bg-white border p-3 rounded shadow-sm" key={team.id}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 team-color-${team.rank} rounded-full mr-3 flex items-center justify-center text-white font-bold`}>
                          {team.rank}
                        </div>
                        <span className="font-medium">Équipe {team.name}</span>
                      </div>
                      <div className="font-bold">{team.score} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Quiz Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="p-6">
            <h3 className="text-xl font-heading font-bold text-eco-dark mb-6">Analyse des résultats</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-eco-light rounded-lg p-4 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-eco-primary rounded-full flex items-center justify-center text-white mb-2">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
                <div className="text-2xl font-bold">{results.correctAnswersPercent}%</div>
                <div className="text-gray-700">Réponses correctes</div>
              </div>
              
              <div className="bg-eco-light rounded-lg p-4 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-eco-primary rounded-full flex items-center justify-center text-white mb-2">
                  <i className="fas fa-bolt text-xl"></i>
                </div>
                <div className="text-2xl font-bold">{results.averageResponseTime} sec</div>
                <div className="text-gray-700">Temps moyen de réponse</div>
              </div>
              
              <div className="bg-eco-light rounded-lg p-4 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-eco-primary rounded-full flex items-center justify-center text-white mb-2">
                  <i className="fas fa-users text-xl"></i>
                </div>
                <div className="text-2xl font-bold">{results.participantCount}</div>
                <div className="text-gray-700">Participants</div>
              </div>
            </div>
            
            {/* Questions Analysis */}
            <h4 className="font-heading font-semibold text-lg mb-4">Questions les plus difficiles</h4>
            
            <div className="space-y-4 mb-8">
              {results.difficultQuestions.map((question: DifficultQuestion) => (
                <div className="border rounded-lg overflow-hidden" key={question.id}>
                  <div className="bg-eco-light p-3">
                    <h5 className="font-medium">Q{question.index + 1}: {question.text}</h5>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-600">
                        Réponse correcte: <span className="font-medium">{question.correctAnswer}</span>
                      </div>
                      <div className="text-sm text-eco-incorrect font-semibold">
                        Seulement {question.correctPercent}% de réponses correctes
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                      {question.answerStats.map((stat, index) => {
                        const letter = String.fromCharCode(65 + index); // A, B, C, D
                        const isCorrect = letter === question.correctAnswerLetter;
                        
                        return (
                          <div className="text-center text-sm p-2 border rounded" key={letter}>
                            <div>{stat.text}</div>
                            <div className={`font-bold ${isCorrect ? 'text-eco-correct' : ''}`}>{stat.percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                className="bg-eco-primary hover:bg-eco-primary-dark text-white font-bold py-3 px-8 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:ring-opacity-50 shadow mr-4"
                onClick={handleNewGame}
              >
                Nouvelle partie
              </Button>
              <Button 
                variant="outline" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Télécharger les résultats
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalResults;
