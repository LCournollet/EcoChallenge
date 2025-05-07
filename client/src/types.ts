// Session Types
export interface Session {
  id: string;
  name: string;
  organizer: string;
  teamCount: number;
  teams: TeamProps[];
  code: string;
  active: boolean;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  isOrganizer: boolean;
}

export interface TeamProps {
  id: string;
  name: string;
  sessionId: string;
  players: Player[];
  score: number;
  color: string;
}

// Quiz Types
export interface Answer {
  text: string;
  correct?: boolean;
  explanation?: string;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  answers: Answer[];
}

export interface QuizState {
  sessionId: string;
  sessionName: string;
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  teamCount: number;
  teamRankings: TeamRanking[];
}

export interface TeamRanking {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export interface AnswerStat {
  text: string;
  percentage: number;
}

export interface QuestionResult {
  sessionId: string;
  question: Question;
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  correctAnswer: Answer;
  correctAnswerLetter: string;
  teamResults: TeamAnswerResult[];
  answerStats: AnswerStat[];
  percentCorrect: number;
  isLastQuestion: boolean;
  isOrganizer: boolean;
}

export interface TeamAnswerResult {
  teamId: string;
  teamName: string;
  teamColor: string;
  isCorrect: boolean;
  pointsEarned: number;
  ranking: number;
}

export interface TeamFinalResult {
  id: string;
  name: string;
  score: number;
  rank: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface DifficultQuestion {
  id: string;
  index: number;
  text: string;
  correctAnswer: string;
  correctAnswerLetter: string;
  correctPercent: number;
  answerStats: AnswerStat[];
}

export interface FinalResultsData {
  sessionId: string;
  sessionName: string;
  teams: TeamFinalResult[];
  correctAnswersPercent: number;
  averageResponseTime: number;
  participantCount: number;
  difficultQuestions: DifficultQuestion[];
}
