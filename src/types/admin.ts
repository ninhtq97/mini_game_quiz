export interface GameDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
  _count: { questions: number; dailyResults: number };
}

export interface Question {
  id: string;
  gameDayId: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer: string;
  order: number;
  points: number;
  timeLimitSeconds: number;
  gameDay: { dayNumber: number; title: string };
  _count: { answers: number };
}
