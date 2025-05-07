import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";
import { useQuery } from "@tanstack/react-query";
import { Session, Player, TeamProps } from "@/types";

const TEAM_NAMES = ["Forêt", "Océan", "Montagne", "Prairie", "Ciel", "Désert"];
const TEAM_COLORS = ["team-color-1", "team-color-2", "team-color-3", "team-color-4", "team-color-5", "team-color-6"];

const WaitingRoom: React.FC = () => {
  const [navigate] = useLocation();
  const [match, params] = useRoute("/waiting/:sessionId");
  const { toast } = useToast();
  const socket = useSocket();
  const sessionId = params?.sessionId;
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Fetch session data
  const { data: session, isLoading, error } = useQuery<Session>({
    queryKey: [`/api/sessions/${sessionId}`],
    enabled: !!sessionId,
  });
  
  useEffect(() => {
    const stored = localStorage.getItem("isOrganizer");
    if (stored === "true") {
      setIsOrganizer(true);
    }
  }, []);

  useEffect(() => {
    console.log("Ardit", socket);
    if (!sessionId || !socket) return;
    
    // Set up socket event listeners
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Ardit",data);
        switch (data.type) {
          case "SESSION_UPDATE":
            if (data.payload.sessionId === sessionId) {
              // Update teams
              setTeams(data.payload.teams);
              // Update participants count
              setParticipantsCount(data.payload.teams.reduce(
                (acc: number, team: TeamProps) => acc + team.players.length, 0
              ));
              console.log(data.payload)
            }
            break;
          case "QUIZ_START":
            if (data.payload.sessionId === sessionId) {
              navigate(`/quiz/${sessionId}`);
            }
            break;
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.addEventListener("message", handleMessage);

    // Send request to join session
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "GET_SESSION_STATE",
        payload: { sessionId }
      }));
    } else {
      const onOpen = () => {
        socket.send(JSON.stringify({
          type: "GET_SESSION_STATE",
          payload: { sessionId }
        }));
        socket.removeEventListener("open", onOpen);
      };
      socket.addEventListener("open", onOpen);
    }

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [sessionId, socket, navigate]);

  const handleStartQuiz = () => {
    if (!socket || !sessionId) return;

    const hasNoPlayersInTeam = teams.some(team => team.players.length === 0);
    
    if (hasNoPlayersInTeam) {
      toast({
        title: "Attention",
        description: "Chaque équipe doit avoir au moins un joueur pour commencer.",
        variant: "destructive"
      });
      return;
    }

    socket.send(JSON.stringify({
      type: "START_QUIZ",
      payload: { sessionId }
    }));
  };

  const copyLinkToClipboard = () => {
    const joinLink = `${window.location.origin}/join/${sessionId}`;
    navigator.clipboard.writeText(joinLink);
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papier."
    });
  };

  if (isLoading) {
    return <div className="text-center p-8">Chargement de la session...</div>;
  }

  if (error || !session) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-500 mb-4">Erreur de chargement</h2>
        <p className="mb-4">Impossible de charger les détails de la session.</p>
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <section id="waiting-room">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 bg-eco-primary text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-heading font-bold">
                Salle d'attente: <span id="session-display-name">{session.name}</span>
              </h2>
              <div className="text-eco-secondary bg-white bg-opacity-20 rounded-full px-4 py-1 text-sm font-semibold">
                Code: <span id="session-code" className="tracking-wide">{sessionId}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-eco-light rounded-lg p-4">
              <div className="mb-4 md:mb-0">
                <h3 className="font-heading font-semibold text-eco-dark">Partagez ce lien avec les participants:</h3>
                <div className="flex items-center mt-2">
                  <input 
                    type="text" 
                    value={`${window.location.origin}/join/${sessionId}`}
                    className="px-3 py-2 border border-gray-300 rounded-l-md w-full md:w-80 text-sm bg-white"
                    readOnly
                  />
                  <button 
                    className="bg-eco-primary text-white px-3 py-2 rounded-r-md hover:bg-eco-primary-dark" 
                    title="Copier le lien"
                    onClick={copyLinkToClipboard}
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="text-center md:text-right">
                  <div className="text-sm text-gray-600 mb-1">Participants connectés</div>
                  <div className="text-2xl font-bold text-eco-primary">{participantsCount}</div>
                </div>
              </div>
            </div>
            
            <h3 className="font-heading font-semibold text-xl text-eco-dark mb-4">Équipes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {teams.map((team, index) => (
                <div className="border rounded-lg overflow-hidden" key={team.id}>
                  <div className={`${TEAM_COLORS[index % TEAM_COLORS.length]} text-white p-3`}>
                    <h4 className="font-heading font-semibold">Équipe {team.name}</h4>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-2">
                      {team.players.length === 0 ? (
                        <li className="text-gray-500 italic">Aucun joueur</li>
                      ) : (
                        team.players.map((player) => (
                          <li className="flex items-center" key={player.id}>
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                              <i className="fas fa-user"></i>
                            </div>
                            <span>{player.name}</span>
                            {player.isOrganizer && (
                              <span className="ml-2 text-xs bg-eco-primary text-white px-2 py-0.5 rounded">
                                Organisateur
                              </span>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isOrganizer && (
                <>
                  <Button 
                    className="bg-eco-primary hover:bg-eco-primary-dark text-white font-bold py-3 px-8 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-eco-primary focus:ring-opacity-50 shadow"
                    onClick={handleStartQuiz}
                  >
                    Commencer le quiz <i className="fas fa-play ml-2"></i>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    onClick={() => navigate("/")}
                  >
                    Annuler
                  </Button>
                </>
              )}
              {!isOrganizer && (
                <div className="text-center p-4 bg-eco-light rounded-lg">
                  <p className="text-lg">En attente du début de la partie par l'organisateur...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitingRoom;
