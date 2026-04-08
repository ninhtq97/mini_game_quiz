export interface QuestionData {
  id: string;
  questionText: string;
  questionType: string;
  options: { id: string; text: string; isCorrect?: boolean }[];
  order: number;
  points: number;
  timeLimitSeconds: number;
  answered: boolean;
  predicted: boolean;
  userAnswer?: { isCorrect: boolean; selectedOptionId: string } | null;
  userPrediction?: { predictedCorrectCount: number } | null;
}

export interface GameDayData {
  id: string;
  dayNumber: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}
