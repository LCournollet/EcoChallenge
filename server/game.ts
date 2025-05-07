import { storage } from "./storage";
import { questions as predefinedQuestions } from "../client/src/lib/questions";
import { nanoid } from "nanoid";
import { broadcastQuizStateUpdate, broadcastShowAnswer, broadcastNextQuestion } from "./sockets";

// Game state interfaces
interface QuizState {
  sessionId: string;
  sessionName: string;
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  teamCount: number;
  teamRankings: TeamRanking[];
}

interface TeamRanking {
  id: string;
  name: string;
  score: number;
  rank: number;
}

interface SessionState {
  quizState: QuizState;
  questions: any[];
  currentQuestionId: string;
  questionEndTime: number;
  questionTimer: NodeJS.Timeout | null;
  quizActive: boolean;
}

// Map to store quiz state for each session
const sessionStates = new Map<string, SessionState>();

// Team color mapping
const teamColors = [
  "team-color-1", "team-color-2", "team-color-3", 
  "team-color-4", "team-color-5", "team-color-6"
];

// Game manager
class GameManager {
  // Initialize quiz for a session
  async initializeQuiz(sessionId: string): Promise<void> {
    try {
      const session = await storage.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Get teams for this session
      const teams = await storage.getTeamsBySessionId(sessionId);
      
      // Shuffle and select questions
      const shuffledQuestions = [...predefinedQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20); // Ensure we use exactly 20 questions
      
      // Store questions in database
      const storedQuestions = await Promise.all(
        shuffledQuestions.map(async (question, index) => {
          const questionRecord = await storage.createQuestion({
            sessionId,
            questionData: JSON.stringify(question),
            order: index,
          });
          return {
            dbId: questionRecord.id,
            ...question,
          };
        })
      );

      // Create initial team rankings
      const teamRankings = teams.map((team, index) => ({
        id: team.id,
        name: team.name,
        score: 0,
        rank: index + 1,
      }));

      // Create quiz state
      const quizState: QuizState = {
        sessionId,
        sessionName: session.name,
        currentQuestion: null,
        currentQuestionIndex: -1, // Will be incremented to 0 when first question starts
        totalQuestions: storedQuestions.length,
        timeRemaining: 0,
        teamCount: teams.length,
        teamRankings,
      };

      // Store session state
      sessionStates.set(sessionId, {
        quizState,
        questions: storedQuestions,
        currentQuestionId: "",
        questionEndTime: 0,
        questionTimer: null,
        quizActive: true,
      });

    } catch (error) {
      console.error("Error initializing quiz:", error);
      throw error;
    }
  }

  // Start the next question for a session
  async startNextQuestion(sessionId: string): Promise<boolean> {
    try {
      const sessionState = sessionStates.get(sessionId);
      if (!sessionState) {
        throw new Error("Quiz not initialized");
      }

      // Clear any existing timer
      if (sessionState.questionTimer) {
        clearInterval(sessionState.questionTimer);
        sessionState.questionTimer = null;
      }

      // Increment question index
      sessionState.quizState.currentQuestionIndex += 1;
      
      // Check if we've reached the end of the quiz
      if (sessionState.quizState.currentQuestionIndex >= sessionState.questions.length) {
        sessionState.quizActive = false;
        return false; // No more questions
      }

      // Get the next question
      const question = sessionState.questions[sessionState.quizState.currentQuestionIndex];
      sessionState.quizState.currentQuestion = question;
      sessionState.currentQuestionId = question.dbId;

      // Set question timer (20 seconds)
      const questionDuration = 20; // seconds
      sessionState.quizState.timeRemaining = questionDuration;
      sessionState.questionEndTime = Date.now() + questionDuration * 1000;

      // Start timer
      sessionState.questionTimer = setInterval(() => {
        this.updateQuestionTimer(sessionId);
      }, 1000);

      // Broadcast updated quiz state
      broadcastQuizStateUpdate(sessionId, sessionState.quizState);

      // Schedule end of question
      setTimeout(() => {
        this.endQuestion(sessionId);
      }, questionDuration * 1000);

      return true;
    } catch (error) {
      console.error("Error starting next question:", error);
      throw error;
    }
  }

  // Update question timer
  private updateQuestionTimer(sessionId: string): void {
    const sessionState = sessionStates.get(sessionId);
    if (!sessionState) return;

    const now = Date.now();
    const timeRemaining = Math.max(0, Math.floor((sessionState.questionEndTime - now) / 1000));
    
    sessionState.quizState.timeRemaining = timeRemaining;
    
    // Broadcast updated timer
    broadcastQuizStateUpdate(sessionId, sessionState.quizState);
    
    // End question if timer reaches 0
    if (timeRemaining <= 0 && sessionState.questionTimer) {
      clearInterval(sessionState.questionTimer);
      sessionState.questionTimer = null;
      this.endQuestion(sessionId);
    }
  }

  // End current question and calculate scores
  private async endQuestion(sessionId: string): Promise<void> {
    try {
      const sessionState = sessionStates.get(sessionId);
      if (!sessionState || !sessionState.currentQuestionId) return;

      // Clear timer if it's still running
      if (sessionState.questionTimer) {
        clearInterval(sessionState.questionTimer);
        sessionState.questionTimer = null;
      }

      // Get current question
      const currentQuestion = sessionState.quizState.currentQuestion;
      const correctAnswerIndex = currentQuestion.answers.findIndex((a: any) => a.correct);
      const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex); // A, B, C, D

      // Get all answers for this question
      const answers = await storage.getAnswersByQuestionId(sessionState.currentQuestionId);
      
      // Calculate scores for each team
      const teams = await storage.getTeamsBySessionId(sessionId);
      
      // Update team scores in database
      for (const team of teams) {
        const teamAnswers = answers.filter(a => a.teamId === team.id);
        if (teamAnswers.length > 0) {
          // Use the highest score from the team's answers
          const highestScore = Math.max(...teamAnswers.map(a => a.pointsEarned));
          const newScore = team.score + highestScore;
          await storage.updateTeam(team.id, { score: newScore });
        }
      }

      // Update team rankings
      const updatedTeams = await storage.getTeamsBySessionId(sessionId);
      const sortedTeams = [...updatedTeams].sort((a, b) => b.score - a.score);
      
      sessionState.quizState.teamRankings = sortedTeams.map((team, index) => ({
        id: team.id,
        name: team.name,
        score: team.score,
        rank: index + 1,
      }));

      // Broadcast to show answer screen
      broadcastShowAnswer(sessionId, sessionState.currentQuestionId);
    } catch (error) {
      console.error("Error ending question:", error);
    }
  }

  // Submit an answer
  async submitAnswer(sessionId: string, questionId: string, playerId: string, teamId: string, answerLetter: string): Promise<void> {
    try {
      const sessionState = sessionStates.get(sessionId);
      if (!sessionState || sessionState.currentQuestionId !== questionId) {
        throw new Error("Question not active");
      }

      // Calculate remaining time
      const timeElapsed = 20 - sessionState.quizState.timeRemaining;
      
      // Get correct answer for the question
      const currentQuestion = sessionState.quizState.currentQuestion;
      const correctAnswerIndex = currentQuestion.answers.findIndex((a: any) => a.correct);
      const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex); // A, B, C, D
      
      // Check if answer is correct
      const isCorrect = answerLetter === correctAnswerLetter;
      
      // Calculate points (based on time taken and correctness)
      let points = 0;
      if (isCorrect) {
        // Max points is 1000, decreases by 50 per second
        points = Math.max(0, 1000 - (timeElapsed * 50));
      }

      // Save answer
      await storage.createAnswer({
        questionId,
        playerId,
        teamId,
        answer: answerLetter,
        isCorrect,
        timeToAnswer: timeElapsed,
        pointsEarned: points,
      });

    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  }

  // Get results for a question
  async getQuestionResults(sessionId: string, questionId: string, isOrganizer: boolean): Promise<any> {
    try {
      const sessionState = sessionStates.get(sessionId);
      if (!sessionState) {
        throw new Error("Quiz not found");
      }

      // Get session and question details
      const session = await storage.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const questionRecord = await storage.getQuestion(questionId);
      if (!questionRecord) {
        throw new Error("Question not found");
      }

      const questionData = JSON.parse(questionRecord.questionData);
      const correctAnswerIndex = questionData.answers.findIndex((a: any) => a.correct);
      const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex); // A, B, C, D
      const correctAnswer = questionData.answers[correctAnswerIndex];

      // Get all answers for this question
      const answers = await storage.getAnswersByQuestionId(questionId);
      
      // Get teams
      const teams = await storage.getTeamsBySessionId(sessionId);
      
      // Calculate results for each team
      const teamResults = await Promise.all(
        teams.map(async (team, index) => {
          const teamAnswers = answers.filter(a => a.teamId === team.id);
          const isCorrect = teamAnswers.some(a => a.isCorrect);
          const pointsEarned = teamAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
          
          return {
            teamId: team.id,
            teamName: team.name,
            teamColor: teamColors[index % teamColors.length],
            isCorrect,
            pointsEarned,
            ranking: sessionState.quizState.teamRankings.find(r => r.id === team.id)?.rank || (index + 1),
          };
        })
      );

      // Sort team results by ranking
      teamResults.sort((a, b) => a.ranking - b.ranking);

      // Calculate answer statistics
      const answerStats = questionData.answers.map((answer: any, index: number) => {
        const letter = String.fromCharCode(65 + index);
        const answerCount = answers.filter(a => a.answer === letter).length;
        const percentage = answers.length > 0 ? Math.round((answerCount / answers.length) * 100) : 0;
        
        return {
          text: answer.text,
          percentage,
        };
      });

      // Calculate percentage of correct answers
      const correctCount = answers.filter(a => a.isCorrect).length;
      const percentCorrect = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

      // Check if this is the last question
      const isLastQuestion = sessionState.quizState.currentQuestionIndex >= sessionState.questions.length - 1;

      return {
        sessionId,
        question: questionData,
        questionId,
        questionIndex: questionRecord.order,
        totalQuestions: sessionState.questions.length,
        correctAnswer,
        correctAnswerLetter,
        teamResults,
        answerStats,
        percentCorrect,
        isLastQuestion,
        isOrganizer,
      };
    } catch (error) {
      console.error("Error getting question results:", error);
      throw error;
    }
  }

  // Get final quiz results
  async getFinalResults(sessionId: string): Promise<any> {
    try {
      const sessionState = sessionStates.get(sessionId);
      if (!sessionState) {
        throw new Error("Quiz not found");
      }

      // Get session details
      const session = await storage.getSession(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Get teams with final scores
      const teams = await storage.getTeamsBySessionId(sessionId);
      
      // Get all questions for this session
      const questions = await storage.getQuestionsBySessionId(sessionId);
      
      // Get all answers for this session
      const allAnswers = await Promise.all(
        questions.map(async (question) => {
          return await storage.getAnswersByQuestionId(question.id);
        })
      );
      const flatAnswers = allAnswers.flat();

      // Calculate team results
      const teamResults = await Promise.all(
        teams.map(async (team) => {
          const teamAnswers = flatAnswers.filter(a => a.teamId === team.id);
          const correctAnswers = teamAnswers.filter(a => a.isCorrect).length;
          
          return {
            id: team.id,
            name: team.name,
            score: team.score,
            rank: sessionState.quizState.teamRankings.find(r => r.id === team.id)?.rank || 0,
            correctAnswers,
            totalAnswers: teamAnswers.length,
          };
        })
      );

      // Sort team results by score (descending)
      teamResults.sort((a, b) => b.score - a.score);
      
      // Assign ranks
      teamResults.forEach((team, index) => {
        team.rank = index + 1;
      });

      // Calculate overall statistics
      const totalAnswers = flatAnswers.length;
      const correctAnswers = flatAnswers.filter(a => a.isCorrect).length;
      const correctAnswersPercent = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      
      // Calculate average response time
      const totalResponseTime = flatAnswers.reduce((sum, a) => sum + a.timeToAnswer, 0);
      const averageResponseTime = totalAnswers > 0 ? Math.round((totalResponseTime / totalAnswers) * 10) / 10 : 0;
      
      // Get participant count
      const players = await storage.getPlayersBySessionId(sessionId);
      const participantCount = players.length;

      // Find the most difficult questions (lowest percentage of correct answers)
      const questionResults = await Promise.all(
        questions.map(async (question) => {
          const questionData = JSON.parse(question.questionData);
          const answers = await storage.getAnswersByQuestionId(question.id);
          
          if (answers.length === 0) return null;
          
          const correctCount = answers.filter(a => a.isCorrect).length;
          const correctPercent = Math.round((correctCount / answers.length) * 100);
          
          const correctAnswerIndex = questionData.answers.findIndex((a: any) => a.correct);
          const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex);
          
          // Calculate answer statistics
          const answerStats = questionData.answers.map((answer: any, index: number) => {
            const letter = String.fromCharCode(65 + index);
            const answerCount = answers.filter(a => a.answer === letter).length;
            const percentage = answers.length > 0 ? Math.round((answerCount / answers.length) * 100) : 0;
            
            return {
              text: answer.text,
              percentage,
            };
          });
          
          return {
            id: question.id,
            index: question.order,
            text: questionData.text,
            correctAnswer: questionData.answers[correctAnswerIndex].text,
            correctAnswerLetter,
            correctPercent,
            answerStats,
          };
        })
      );

      // Filter out null results and sort by correctPercent (ascending)
      const validQuestionResults = questionResults
        .filter(q => q !== null) as any[];
      validQuestionResults.sort((a, b) => a.correctPercent - b.correctPercent);
      
      // Take the 2 most difficult questions
      const difficultQuestions = validQuestionResults.slice(0, 2);

      return {
        sessionId,
        sessionName: session.name,
        teams: teamResults,
        correctAnswersPercent,
        averageResponseTime,
        participantCount,
        difficultQuestions,
      };
    } catch (error) {
      console.error("Error getting final results:", error);
      throw error;
    }
  }

  // Get current quiz state
  getQuizState(sessionId: string): QuizState | null {
    const sessionState = sessionStates.get(sessionId);
    return sessionState?.quizState || null;
  }

  // Check if quiz is active
  isQuizActive(sessionId: string): boolean {
    const sessionState = sessionStates.get(sessionId);
    return !!sessionState?.quizActive;
  }
}

export const gameManager = new GameManager();
