import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";
import { useQuery } from "@tanstack/react-query";
import { Session, TeamProps } from "@/types";

const PlayerJoin: React.FC = () => {
  const [match, params] = useRoute("/join/:sessionId");
  const sessionId = params?.sessionId;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const socket = useSocket();
  
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch session data
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery<Session>({
    queryKey: [`/api/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!sessionId || !socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "SESSION_TEAMS" && data.payload.sessionId === sessionId) {
          setTeams(data.payload.teams);
        } else if (data.type === "JOIN_SUCCESS" && data.payload.sessionId === sessionId) {
          navigate(`/waiting/${sessionId}`);
        } else if (data.type === "QUIZ_ACTIVE" && data.payload.sessionId === sessionId) {
          navigate(`/quiz/${sessionId}`);
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    socket.addEventListener("message", handleMessage);

    // Request available teams
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "GET_AVAILABLE_TEAMS",
        payload: { sessionId }
      }));
    } else {
      const onOpen = () => {
        socket.send(JSON.stringify({
          type: "GET_AVAILABLE_TEAMS",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim() || !selectedTeam) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre nom et sélectionner une équipe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    if (socket && sessionId) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "JOIN_TEAM",
          payload: {
            sessionId,
            playerName: playerName.trim(),
            teamId: selectedTeam
          }
        }));
      } else {
        const onOpen = () => {
          socket.send(JSON.stringify({
            type: "JOIN_TEAM",
            payload: {
              sessionId,
              playerName: playerName.trim(),
              teamId: selectedTeam
            }
          }));
          socket.removeEventListener("open", onOpen);
        };
        socket.addEventListener("open", onOpen);
      }
      
      // In a real app we'd wait for the JOIN_SUCCESS message to navigate,
      // but let's add a timeout for safety
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  if (sessionLoading) {
    return <div className="text-center p-8">Chargement de la session...</div>;
  }

  if (sessionError || !session) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-500 mb-4">Session introuvable</h2>
        <p className="mb-4">La session que vous essayez de rejoindre n'existe pas ou a expiré.</p>
        <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
      </div>
    );
  }

  return (
    <section id="player-join">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div 
          className="h-32 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300')" }}
        ></div>
        
        <div className="p-6">
          <div className="flex items-center mb-6">
            <i className="fas fa-leaf text-eco-primary text-2xl mr-3"></i>
            <h2 className="text-2xl font-heading font-bold text-eco-dark">Rejoindre EcoTeam Challenge</h2>
          </div>
          
          <div className="text-center bg-eco-light p-4 rounded-lg mb-6">
            <p className="text-lg">Session: <span className="font-bold">{session.name}</span></p>
            <p className="text-sm text-gray-600">Code: <span className="font-medium">{sessionId}</span></p>
          </div>
          
          <form id="join-form" className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
              <input 
                type="text" 
                id="player-name" 
                name="playerName" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eco-primary focus:border-eco-primary" 
                placeholder="Entrez votre nom"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">Choisissez votre équipe</label>
              <select 
                id="team-select" 
                name="teamSelect" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eco-primary focus:border-eco-primary"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                required
              >
                <option value="" disabled>Sélectionnez une équipe</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    Équipe {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'En cours...' : 'Rejoindre la partie'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PlayerJoin;
