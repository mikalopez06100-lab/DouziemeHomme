"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useGameSessionStore } from "@/store/gameSession";
import { CategoryPicker } from "@/components/game/CategoryPicker";
import { QuestionCard } from "@/components/game/QuestionCard";
import { useCurrentQuestion } from "@/hooks/useCurrentQuestion";

export default function GamePage() {
  const currentPlayer = useGameSessionStore((s) => s.getCurrentPlayer());
  const currentCategory = useGameSessionStore((s) => s.currentCategory);
  const setCurrentCategory = useGameSessionStore((s) => s.setCurrentCategory);
  const nextPlayer = useGameSessionStore((s) => s.nextPlayer);

  const { question, loadQuestion, markAsAsked, isLoading, error } =
    useCurrentQuestion(currentCategory);

  useEffect(() => {
    if (currentCategory) loadQuestion();
  }, [currentCategory, loadQuestion]);

  const handleCorrect = () => {
    markAsAsked();
    loadQuestion();
  };

  const handleWrong = () => {
    markAsAsked();
    nextPlayer();
    setCurrentCategory(null);
  };

  if (!currentPlayer) {
    return (
      <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
        <p className="relative mb-4">Aucune partie en cours.</p>
        <Link href="/setup" className="relative text-red-400 hover:text-red-300 underline">
          Paramétrer une partie
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <div className="relative flex flex-col flex-1 items-center py-6 px-4 max-w-xl mx-auto">
        <div className="h-20 shrink-0" aria-hidden />

        <p className="text-base sm:text-lg font-bold uppercase tracking-wide text-white mb-4 drop-shadow-md">
          Joueur actuel : <span className="text-amber-300">{currentPlayer.name}</span>
        </p>

        {!currentCategory ? (
          <CategoryPicker onSelect={setCurrentCategory} />
        ) : isLoading ? (
          <p className="text-slate-300">Chargement…</p>
        ) : question ? (
          <QuestionCard
            question={question}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />
        ) : (
          <div className="text-center">
            {error && (
              <p className="text-red-400 text-sm mb-2">{error}</p>
            )}
            <p className="text-slate-300 mb-2">
              Aucune question dans cette catégorie.
            </p>
            <button
              type="button"
              onClick={() => setCurrentCategory(null)}
              className="text-orange-400 underline"
            >
              Changer de catégorie
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
