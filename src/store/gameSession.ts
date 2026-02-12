"use client";

import { create } from "zustand";
import type { QuestionCategory } from "@/types/categories";
import type { GameSessionState, Player } from "@/types/game";

interface GameSessionStore extends GameSessionState {
  initSession: (names: string[]) => void;
  getCurrentPlayer: () => Player | null;
  nextPlayer: () => void;
  setCurrentCategory: (cat: QuestionCategory | null) => void;
  addAskedQuestion: (cat: QuestionCategory, questionId: string) => void;
  resetSession: () => void;
}

const initialAsked = (): Record<QuestionCategory, string[]> => ({
  club: [],
  foot: [],
  culture_locale: [],
  enfants: [],
});

export const useGameSessionStore = create<GameSessionStore>((set, get) => ({
  players: [],
  currentPlayerIndex: 0,
  askedQuestionIdsByCategory: initialAsked(),
  currentCategory: null,
  startedAt: null,

  initSession: (names: string[]) =>
    set(() => {
      const trimmed = names.map((n) => n.trim()).filter(Boolean);
      const players: Player[] = trimmed.map((name, idx) => ({
        id: `${Date.now()}-${idx}`,
        name,
        order: idx,
      }));
      return {
        players,
        currentPlayerIndex: 0,
        askedQuestionIdsByCategory: initialAsked(),
        currentCategory: null,
        startedAt: players.length > 0 ? Date.now() : null,
      };
    }),

  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    if (!players.length) return null;
    return players[currentPlayerIndex] ?? null;
  },

  nextPlayer: () =>
    set((state) => {
      if (state.players.length === 0) return state;
      const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
      return { ...state, currentPlayerIndex: nextIndex, currentCategory: null };
    }),

  setCurrentCategory: (cat) => set(() => ({ currentCategory: cat })),

  addAskedQuestion: (cat, questionId) =>
    set((state) => {
      const already = state.askedQuestionIdsByCategory[cat] ?? [];
      if (already.includes(questionId)) return state;
      return {
        askedQuestionIdsByCategory: {
          ...state.askedQuestionIdsByCategory,
          [cat]: [...already, questionId],
        },
      };
    }),

  resetSession: () =>
    set(() => ({
      players: [],
      currentPlayerIndex: 0,
      askedQuestionIdsByCategory: initialAsked(),
      currentCategory: null,
      startedAt: null,
    })),
}));
