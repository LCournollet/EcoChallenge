import { 
  Session, InsertSession, 
  Team, InsertTeam, 
  Player, InsertPlayer, 
  Question, InsertQuestion, 
  Answer, InsertAnswer 
} from "@shared/schema";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // Session operations
  createSession(session: Omit<Session, "active" | "createdAt">): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, data: Partial<Session>): Promise<Session | undefined>;
  
  // Team operations
  createTeam(team: Omit<Team, "score">): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsBySessionId(sessionId: string): Promise<Team[]>;
  updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined>;
  
  // Player operations
  createPlayer(player: Omit<Player, "id">): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByTeamId(teamId: string): Promise<Player[]>;
  getPlayersBySessionId(sessionId: string): Promise<Player[]>;
  updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined>;
  
  // Question operations
  createQuestion(question: Omit<Question, "id">): Promise<Question>;
  getQuestion(id: string): Promise<Question | undefined>;
  getQuestionsBySessionId(sessionId: string): Promise<Question[]>;
  
  // Answer operations
  createAnswer(answer: Omit<Answer, "id" | "createdAt">): Promise<Answer>;
  getAnswersByQuestionId(questionId: string): Promise<Answer[]>;
  getAnswersByPlayerId(playerId: string): Promise<Answer[]>;
  getAnswersByTeamId(teamId: string): Promise<Answer[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private teams: Map<string, Team>;
  private players: Map<string, Player>;
  private questions: Map<string, Question>;
  private answers: Map<number, Answer>;
  private currentAnswerId: number;

  constructor() {
    this.sessions = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.currentAnswerId = 1;
  }

  // Session operations
  async createSession(sessionData: Omit<Session, "active" | "createdAt">): Promise<Session> {
    const now = new Date().toISOString();
    const session: Session = {
      ...sessionData,
      active: true,
      createdAt: now,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: Session = { ...session, ...data };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Team operations
  async createTeam(teamData: Omit<Team, "score">): Promise<Team> {
    const team: Team = {
      ...teamData,
      score: 0,
    };
    this.teams.set(team.id, team);
    return team;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsBySessionId(sessionId: string): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(team => team.sessionId === sessionId);
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    const updatedTeam: Team = { ...team, ...data };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  // Player operations
  async createPlayer(playerData: Omit<Player, "id">): Promise<Player> {
    const player: Player = {
      id: nanoid(),
      ...playerData,
    };
    this.players.set(player.id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByTeamId(teamId: string): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.teamId === teamId);
  }

  async getPlayersBySessionId(sessionId: string): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.sessionId === sessionId);
  }

  async updatePlayer(id: string, data: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer: Player = { ...player, ...data };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  // Question operations
  async createQuestion(questionData: Omit<Question, "id">): Promise<Question> {
    const question: Question = {
      id: nanoid(),
      ...questionData,
    };
    this.questions.set(question.id, question);
    return question;
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsBySessionId(sessionId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.sessionId === sessionId)
      .sort((a, b) => a.order - b.order);
  }

  // Answer operations
  async createAnswer(answerData: Omit<Answer, "id" | "createdAt">): Promise<Answer> {
    const now = new Date().toISOString();
    const answer: Answer = {
      id: this.currentAnswerId++,
      ...answerData,
      createdAt: now,
    };
    this.answers.set(answer.id, answer);
    return answer;
  }

  async getAnswersByQuestionId(questionId: string): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.questionId === questionId);
  }

  async getAnswersByPlayerId(playerId: string): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.playerId === playerId);
  }

  async getAnswersByTeamId(teamId: string): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.teamId === teamId);
  }
}

export const storage = new MemStorage();
