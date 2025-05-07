import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";
import { apiRequest } from "@/lib/queryClient";

const SessionSetup: React.FC = () => {
  const [organizerName, setOrganizerName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [teamCount, setTeamCount] = useState("4");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const socket = useSocket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizerName.trim() || !sessionName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Submitting new session with", { organizerName, sessionName, teamCount });
      const response = await apiRequest("POST", "/api/sessions", {
        organizerName,
        sessionName,
        teamCount: parseInt(teamCount),
      });
      
      const session = await response.json();
      console.log("Session created:", session);

      if (!session.id) {
        throw new Error("Session ID missing from response");
      }
      
      // Join as organizer with socket
      if (socket) {
        try {
          socket.send(JSON.stringify({
            type: "JOIN_SESSION",
            payload: {
              sessionId: session.id,
              playerName: organizerName,
              isOrganizer: true,
            },
          }));
          localStorage.setItem("isOrganizer", "true");
          console.log("Sent JOIN_SESSION message via socket");
        } catch (sendError) {
          console.error("Failed to send JOIN_SESSION via socket", sendError);
        }
      } else {
        console.warn("Socket not initialized when trying to send JOIN_SESSION");
      }

      navigate(`/waiting/${session.id}`);
      console.log("Navigated to waiting room");
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="session-setup">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-heading font-bold text-eco-dark mb-6">Créer une nouvelle session</h2>
          
          <form id="session-form" className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="organizer-name" className="block text-sm font-medium text-gray-700 mb-1">Votre nom (organisateur)</label>
              <input 
                type="text" 
                id="organizer-name" 
                name="organizerName" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eco-primary focus:border-eco-primary"
                placeholder="Entrez votre nom"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la session</label>
              <input 
                type="text" 
                id="session-name" 
                name="sessionName" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eco-primary focus:border-eco-primary"
                placeholder="Ex: EcoTeam Challenge Entreprise XYZ"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="team-count" className="block text-sm font-medium text-gray-700 mb-1">Nombre d'équipes</label>
              <select 
                id="team-count" 
                name="teamCount" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-eco-primary focus:border-eco-primary"
                value={teamCount}
                onChange={(e) => setTeamCount(e.target.value)}
                required
              >
                <option value="2">2 équipes</option>
                <option value="3">3 équipes</option>
                <option value="4">4 équipes</option>
                <option value="5">5 équipes</option>
                <option value="6">6 équipes</option>
              </select>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Création en cours...</span>
                ) : (
                  <span>Créer la session</span>
                )}
              </Button>
            </div>
            
            <div className="pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-eco-primary hover:text-eco-primary-dark"
                onClick={() => navigate("/")}
              >
                <i className="fas fa-arrow-left mr-2"></i> Retour
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SessionSetup;
