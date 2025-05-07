import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organizer: text("organizer").notNull(),
  teamCount: integer("team_count").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  name: true,
  organizer: true,
  teamCount: true,
});

// Teams table
export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  score: integer("score").default(0),
  color: text("color").notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  sessionId: true,
  color: true,
});

// Players table
export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  teamId: text("team_id").notNull().references(() => teams.id),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  isOrganizer: boolean("is_organizer").default(false),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  teamId: true,
  sessionId: true,
  isOrganizer: true,
});

// Questions table (for tracking which questions have been used in a session)
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  questionData: text("question_data").notNull(), // JSON string of question data
  order: integer("order").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  sessionId: true,
  questionData: true,
  order: true,
});

// Answers table (for tracking player answers)
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: text("question_id").notNull().references(() => questions.id),
  playerId: text("player_id").notNull().references(() => players.id),
  teamId: text("team_id").notNull().references(() => teams.id),
  answer: text("answer").notNull(), // A, B, C, D
  isCorrect: boolean("is_correct").notNull(),
  timeToAnswer: integer("time_to_answer").notNull(), // in seconds
  pointsEarned: integer("points_earned").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  questionId: true,
  playerId: true,
  teamId: true,
  answer: true,
  isCorrect: true,
  timeToAnswer: true,
  pointsEarned: true,
});

// Type definitions
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;
