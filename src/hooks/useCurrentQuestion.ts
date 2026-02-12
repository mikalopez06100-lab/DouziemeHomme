"use client";

import { useCallback, useState } from "react";
import { pickRandomQuestion } from "@/lib/questionEngine";
import { useGameSessionStore } from "@/store/gameSession";
import { fetchQuestionsByCategory } from "@/lib/questionRepository";
import type { QuestionCategory } from "@/types/categories";
import type { Question } from "@/types/game";

export function useCurrentQuestion(category: QuestionCategory | null) {
  const askedByCategory = useGameSessionStore(
    (s) => s.askedQuestionIdsByCategory
  );
  const addAskedQuestion = useGameSessionStore((s) => s.addAskedQuestion);

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    if (!category) return;
    setError(null);
    setIsLoading(true);
    try {
      const excludeIds = askedByCategory[category] ?? [];
      const list = await fetchQuestionsByCategory(category, excludeIds);
      const next =
        list.length > 0
          ? pickRandomQuestion(list, category, excludeIds)
          : null;
      setQuestion(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur chargement");
      setQuestion(null);
    } finally {
      setIsLoading(false);
    }
  }, [category, askedByCategory]);

  const markAsAsked = useCallback(() => {
    if (question && category) addAskedQuestion(category, question.id);
  }, [question, category, addAskedQuestion]);

  return { question, loadQuestion, markAsAsked, isLoading, error };
}
