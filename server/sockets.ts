import { WebSocket } from "ws";
import { storage } from "./storage";
import { gameManager } from "./game";
import { nanoid } from "nanoid";
import { log } from "./vite";

// Client connection map
interface ClientConnection {
  socket: WebSocket;
  playerId?: string;
  sessionId?: string;
  isOrganizer?: boolean;
}

// Map of client connections
const clients = new Map<string, ClientConnection>();

export function handleSocketConnection(socket: WebSocket) {
  const clientId = nanoid();
  clients.set(clientId, { socket });

  log(`New WebSocket connection established: ${clientId}`);

  socket.on("message", async (message: string) => {
    try {
      const data = JSON.parse(message);
      log(`Received message: ${data.type} from client ${clientId}`);

      switch (data.type) {
        case "JOIN_SESSION":
          await handleJoinSession(clientId, data.payload);
          break;
        case "GET_SESSION_STATE":
          await handleGetSessionState(clientId, data.payload);
          break;
        case "GET_AVAILABLE_TEAMS":
          await handleGetAvailableTeams(clientId, data.payload);
          break;
        case "JOIN_TEAM":
          await handleJoinTeam(clientId, data.payload);
          break;
        case "START_QUIZ":
          await handleStartQuiz(clientId, data.payload);
          break;
        case "GET_QUIZ_STATE":
          await handleGetQuizState(clientId, data.payload);
          break;
        case "SUBMIT_ANSWER":
          await handleSubmitAnswer(clientId, data.payload);
          break;
        case "GET_QUESTION_RESULTS":
          await handleGetQuestionResults(clientId, data.payload);
          break;
        case "REQUEST_NEXT_QUESTION":
          await handleRequestNextQuestion(clientId, data.payload);
          break;
        case "GET_FINAL_RESULTS":
          await handleGetFinalResults(clientId, data.payload);
          break;
        default:
          sendToClient(clientId, {
            type: "ERROR",
            payload: { message: "Unknown message type" },
          });
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Failed to process message" },
      });
    }
  });

  socket.on("close", () => {
    const client = clients.get(clientId);
    if (client && client.sessionId && client.playerId) {
      // Notify other clients in the session about the disconnection
      broadcastToSession(client.sessionId, {
        type: "PLAYER_DISCONNECTED",
        payload: { playerId: client.playerId, sessionId: client.sessionId },
      }, clientId);
    }
    clients.delete(clientId);
    log(`WebSocket connection closed: ${clientId}`);
  });

  socket.on("error", (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    clients.delete(clientId);
  });
}

// Handle client joining a session
async function handleJoinSession(clientId: string, payload: { sessionId: string; playerName: string; isOrganizer: boolean }) {
  const { sessionId, playerName, isOrganizer } = payload;
  
  try {
    // Check if session exists
    const session = await storage.getSession(sessionId);
    if (!session) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Session not found" },
      });
    }

    // Store client session info
    const client = clients.get(clientId);
    if (client) {
      client.sessionId = sessionId;
      client.isOrganizer = isOrganizer;
    }

    // Send current session state
    await handleGetSessionState(clientId, { sessionId });
  } catch (error) {
    console.error("Error joining session:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to join session" },
    });
  }
}

// Handle request for session state
async function handleGetSessionState(clientId: string, payload: { sessionId: string }) {
  const { sessionId } = payload;
  
  try {
    // Get session and teams
    const session = await storage.getSession(sessionId);
    if (!session) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Session not found" },
      });
    }

    const teams = await storage.getTeamsBySessionId(sessionId);
    
    // Get players for each team
    const teamsWithPlayers = await Promise.all(
      teams.map(async (team) => {
        const players = await storage.getPlayersByTeamId(team.id);
        return {
          ...team,
          players,
        };
      })
    );

    // Check if client is the organizer
    const client = clients.get(clientId);
    const isOrganizer = client?.isOrganizer || false;

    // Send session state to client
    sendToClient(clientId, {
      type: "SESSION_UPDATE",
      payload: {
        sessionId,
        sessionName: session.name,
        teams: teamsWithPlayers,
        isOrganizer,
      },
    });

    // If the quiz is already active, send notification
    const isQuizActive = gameManager.isQuizActive(sessionId);
    if (isQuizActive) {
      sendToClient(clientId, {
        type: "QUIZ_ACTIVE",
        payload: { sessionId },
      });
    }
  } catch (error) {
    console.error("Error getting session state:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to get session state" },
    });
  }
}

// Handle getting available teams
async function handleGetAvailableTeams(clientId: string, payload: { sessionId: string }) {
  const { sessionId } = payload;
  
  try {
    const teams = await storage.getTeamsBySessionId(sessionId);
    
    sendToClient(clientId, {
      type: "SESSION_TEAMS",
      payload: {
        sessionId,
        teams,
      },
    });
  } catch (error) {
    console.error("Error getting available teams:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to get available teams" },
    });
  }
}

// Handle player joining a team
async function handleJoinTeam(clientId: string, payload: { sessionId: string; playerName: string; teamId: string }) {
  const { sessionId, playerName, teamId } = payload;
  
  try {
    // Check if session exists
    const session = await storage.getSession(sessionId);
    if (!session) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Session not found" },
      });
    }

    // Check if team exists
    const team = await storage.getTeam(teamId);
    if (!team || team.sessionId !== sessionId) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Team not found" },
      });
    }

    // Create player
    const player = await storage.createPlayer({
      name: playerName,
      teamId,
      sessionId,
      isOrganizer: false,
    });

    // Update client with player info
    const client = clients.get(clientId);
    if (client) {
      client.playerId = player.id;
      client.sessionId = sessionId;
    }

    // Send success response
    sendToClient(clientId, {
      type: "JOIN_SUCCESS",
      payload: {
        sessionId,
        playerId: player.id,
        teamId,
      },
    });

    // Broadcast updated session state to all clients in the session
    broadcastSessionUpdate(sessionId);
  } catch (error) {
    console.error("Error joining team:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to join team" },
    });
  }
}

// Handle starting the quiz
async function handleStartQuiz(clientId: string, payload: { sessionId: string }) {
  const { sessionId } = payload;
  
  try {
    // Check if client is the organizer
    const client = clients.get(clientId);
    if (!client || !client.isOrganizer) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Only the organizer can start the quiz" },
      });
    }

    // Initialize and start quiz
    await gameManager.initializeQuiz(sessionId);
    
    // Broadcast quiz start to all clients in the session
    broadcastToSession(sessionId, {
      type: "QUIZ_START",
      payload: { sessionId },
    });

    // Send first question after a short delay
    setTimeout(() => {
      gameManager.startNextQuestion(sessionId);
    }, 2000);
  } catch (error) {
    console.error("Error starting quiz:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to start quiz" },
    });
  }
}

// Handle getting current quiz state
async function handleGetQuizState(clientId: string, payload: { sessionId: string }) {
  const { sessionId } = payload;
  
  try {
    const quizState = gameManager.getQuizState(sessionId);
    if (!quizState) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Quiz not found or not active" },
      });
    }

    sendToClient(clientId, {
      type: "QUIZ_STATE_UPDATE",
      payload: quizState,
    });
  } catch (error) {
    console.error("Error getting quiz state:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to get quiz state" },
    });
  }
}

// Handle submitting an answer
async function handleSubmitAnswer(clientId: string, payload: { sessionId: string; questionId: string; answer: string }) {
  const { sessionId, questionId, answer } = payload;
  
  try {
    const client = clients.get(clientId);
    if (!client || !client.playerId) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Player not found" },
      });
    }

    const player = await storage.getPlayer(client.playerId);
    if (!player) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Player not found" },
      });
    }

    await gameManager.submitAnswer(sessionId, questionId, player.id, player.teamId, answer);
    
    sendToClient(clientId, {
      type: "ANSWER_RECEIVED",
      payload: { sessionId, questionId },
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to submit answer" },
    });
  }
}

// Handle getting question results
async function handleGetQuestionResults(clientId: string, payload: { sessionId: string; questionId: string }) {
  const { sessionId, questionId } = payload;
  
  try {
    const client = clients.get(clientId);
    const isOrganizer = client?.isOrganizer || false;
    
    const results = await gameManager.getQuestionResults(sessionId, questionId, isOrganizer);
    if (!results) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Results not found" },
      });
    }

    sendToClient(clientId, {
      type: "QUESTION_RESULTS",
      payload: results,
    });
  } catch (error) {
    console.error("Error getting question results:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to get question results" },
    });
  }
}

// Handle request for next question
async function handleRequestNextQuestion(clientId: string, payload: { sessionId: string }) {
  const { sessionId } = payload;
  
  try {
    // Check if client is the organizer
    const client = clients.get(clientId);
    if (!client || !client.isOrganizer) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Only the organizer can advance to the next question" },
      });
    }

    const hasNextQuestion = await gameManager.startNextQuestion(sessionId);
    
    if (!hasNextQuestion) {
      // This was the last question, end the quiz
      broadcastToSession(sessionId, {
        type: "QUIZ_ENDED",
        payload: { sessionId },
      });
    }
  } catch (error) {
    console.error("Error advancing to next question:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to advance to next question" },
    });
  }
}

// Handle getting final results
async function handleGetFinalResults(clientId: string, payload: { sessionId: string }) {
  const { sessionId } = payload;
  
  try {
    const finalResults = await gameManager.getFinalResults(sessionId);
    if (!finalResults) {
      return sendToClient(clientId, {
        type: "ERROR",
        payload: { message: "Final results not found" },
      });
    }

    sendToClient(clientId, {
      type: "FINAL_RESULTS",
      payload: finalResults,
    });
  } catch (error) {
    console.error("Error getting final results:", error);
    sendToClient(clientId, {
      type: "ERROR",
      payload: { message: "Failed to get final results" },
    });
  }
}

// Helper function to send message to a client
function sendToClient(clientId: string, data: any) {
  const client = clients.get(clientId);
  if (client && client.socket.readyState === WebSocket.OPEN) {
    client.socket.send(JSON.stringify(data));
  }
}

// Helper function to broadcast to all clients in a session
function broadcastToSession(sessionId: string, data: any, excludeClientId?: string) {
  for (const [clientId, client] of clients.entries()) {
    if (client.sessionId === sessionId && clientId !== excludeClientId && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(data));
    }
  }
}

// Helper function to broadcast session update to all clients in a session
async function broadcastSessionUpdate(sessionId: string) {
  try {
    const session = await storage.getSession(sessionId);
    if (!session) return;

    const teams = await storage.getTeamsBySessionId(sessionId);
    
    // Get players for each team
    const teamsWithPlayers = await Promise.all(
      teams.map(async (team) => {
        const players = await storage.getPlayersByTeamId(team.id);
        return {
          ...team,
          players,
        };
      })
    );

    // Send personalized session update to each client in the session with their isOrganizer flag
    for (const [clientId, client] of clients.entries()) {
      if (client.sessionId === sessionId && client.socket.readyState === client.socket.OPEN) {
        const isOrganizer = client.isOrganizer || false;
        client.socket.send(JSON.stringify({
          type: "SESSION_UPDATE",
          payload: {
            sessionId,
            sessionName: session.name,
            teams: teamsWithPlayers,
            isOrganizer,
          },
        }));
      }
    }
  } catch (error) {
    console.error("Error broadcasting session update:", error);
  }
}

// Export function to broadcast quiz state update
export function broadcastQuizStateUpdate(sessionId: string, quizState: any) {
  broadcastToSession(sessionId, {
    type: "QUIZ_STATE_UPDATE",
    payload: quizState,
  });
}

// Export function to broadcast that it's time to show the answer
export function broadcastShowAnswer(sessionId: string, questionId: string) {
  broadcastToSession(sessionId, {
    type: "SHOW_ANSWER",
    payload: { sessionId, questionId },
  });
}

// Export function to broadcast the next question
export function broadcastNextQuestion(sessionId: string) {
  broadcastToSession(sessionId, {
    type: "NEXT_QUESTION",
    payload: { sessionId },
  });
}
