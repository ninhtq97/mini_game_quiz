export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: QuestionOption[];
  order: number;
  points: number;
  timeLimitSeconds: number;
  imageUrl?: string | null;
}

export interface QuizQuestionForPlayer {
  id: string;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: { id: string; text: string }[];
  order: number;
  points: number;
  timeLimitSeconds: number;
  imageUrl?: string | null;
}

export interface GameDayInfo {
  id: string;
  dayNumber: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
  questions: QuizQuestionForPlayer[];
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedOptionId: string;
  timeSpentMs: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctOptionId: string;
  answerId: string;
}

export interface SubmitPredictionRequest {
  questionId: string;
  predictedCorrectCount: number;
}

export interface DailyLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  correctAnswers: number;
  totalDeviation: number;
  totalTimeMs: number;
  dailyScore: number;
  isWinner: boolean;
}

export interface OverallLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  totalCorrectAnswers: number;
  totalScore: number;
  daysPlayed: number;
  dailyWins: number;
}

export interface UserStats {
  totalCorrectAnswers: number;
  totalScore: number;
  daysPlayed: number;
  currentRank: number;
  dailyWins: number;
  bestDayScore: number;
}

export interface AdminStats {
  totalPlayers: number;
  totalDays: number;
  totalQuestions: number;
  activeDayNumber: number | null;
  totalAnswersToday: number;
}
