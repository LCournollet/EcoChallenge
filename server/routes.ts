import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { z } from "zod";
import { handleSocketConnection } from "./sockets";

export async function registerRoutes(app: Express): Promise<Server> {
  // HTTP routes
  app.post("/api/sessions", async (req, res) => {
    try {
      const schema = z.object({
        organizerName: z.string().min(1),
        sessionName: z.string().min(1),
        teamCount: z.number().int().min(2).max(6),
      });

      const data = schema.parse(req.body);
      
      // Generate unique session ID
      const sessionId = nanoid(6).toUpperCase();
      
      // Create session
      const session = await storage.createSession({
        id: sessionId,
        name: data.sessionName,
        organizer: data.organizerName,
        teamCount: data.teamCount,
      });
      
      // Create teams for the session
      const teamNames = ["Forêt", "Océan", "Montagne", "Prairie", "Ciel", "Désert"];
      const teamColors = ["team-color-1", "team-color-2", "team-color-3", "team-color-4", "team-color-5", "team-color-6"];
      
      for (let i = 0; i < data.teamCount; i++) {
        await storage.createTeam({
          id: nanoid(),
          name: teamNames[i],
          sessionId: sessionId,
          color: teamColors[i],
        });
      }
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Get teams for this session
      const teams = await storage.getTeamsBySessionId(sessionId);
      
      res.json({
        ...session,
        teams,
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', handleSocketConnection);

  return httpServer;
}
