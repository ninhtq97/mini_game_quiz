"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { GameDayData, QuestionData } from "@/types";

export interface QuizOverviewData {
  status: string;
  gameDay?: GameDayData;
  questions?: QuestionData[];
  nextDay?: {
    dayNumber: number;
    title: string;
    startTime: string;
  };
}

interface QuizContextType {
  quizData: QuizOverviewData | null;
  loading: boolean;
  refreshQuiz: () => Promise<void>;
  setQuizData: React.Dispatch<React.SetStateAction<QuizOverviewData | null>>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useSession();
  const [quizData, setQuizData] = useState<QuizOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quiz/today");
      const data = await res.json();
      setQuizData(data);
    } catch (error) {
      console.error("Failed to load quiz data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      refreshQuiz();
    } else if (authStatus === "unauthenticated") {
      setQuizData(null);
      setLoading(false);
    }
  }, [authStatus, refreshQuiz]);

  return (
    <QuizContext.Provider
      value={{ quizData, loading, refreshQuiz, setQuizData }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
