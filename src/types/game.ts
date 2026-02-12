import type { QuestionCategory } from "./categories";

export interface Question {
  id: string;
  category: QuestionCategory;
  prompt: string;
  choices: string[];
  answerIndex: number;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  isActive: boolean;
}

export interface Player {
  id: string;
  name: string;
  order: number;
}

export interface GameSessionState {
  players: Player[];
  currentPlayerIndex: number;
  askedQuestionIdsByCategory: Record<QuestionCategory, string[]>;
  currentCategory: QuestionCategory | null;
  startedAt: number | null;
}
