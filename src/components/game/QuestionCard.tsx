"use client";

import { useMemo, useState } from "react";
import { shuffleChoices } from "@/lib/questionEngine";
import type { Question } from "@/types/game";

interface QuestionCardProps {
  question: Question;
  onCorrect: () => void;
  onWrong: () => void;
}

export function QuestionCard({ question, onCorrect, onWrong }: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const displayQuestion = useMemo(() => {
    const { choices, answerIndex } = shuffleChoices(
      question.choices,
      question.answerIndex
    );
    return { ...question, choices, answerIndex };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shuffle une seule fois par question.id
  }, [question.id]);

  const handleChoice = (index: number) => {
    if (feedback !== null) return;
    setSelectedIndex(index);
    const correct = index === displayQuestion.answerIndex;
    setFeedback(correct ? "correct" : "wrong");
  };

  const handleNextQuestion = () => {
    onCorrect();
  };

  const handleNextTurn = () => {
    onWrong();
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      {/* Indicateurs discrets */}
      <div className="flex justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500/80" />
        <span className="w-2 h-2 rounded-full bg-slate-500/50" />
        <span className="w-2 h-2 rounded-full bg-slate-500/50" />
      </div>

      {/* Bloc question sobre */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-600/80">
        <p className="text-base md:text-lg font-bold text-white uppercase tracking-wide leading-snug">
          {displayQuestion.prompt}
        </p>
      </div>

      {/* Réponses : fond bleu nuit, bordure grise */}
      <ul className="space-y-3">
        {displayQuestion.choices.map((choice, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = idx === displayQuestion.answerIndex;
          const showCorrect = feedback === "wrong" && isCorrect;
          const showWrong = feedback === "wrong" && isSelected && !isCorrect;

          let btnClass =
            "w-full text-left py-3.5 px-4 rounded-xl border transition-all font-bold text-white uppercase tracking-wide ";
          if (feedback === null) {
            btnClass += "bg-slate-800/90 border-slate-500 hover:border-slate-400 hover:bg-slate-700/90";
          } else if (showCorrect || (isSelected && feedback === "correct")) {
            btnClass += "bg-emerald-600/90 border-emerald-500 text-white";
          } else if (showWrong) {
            btnClass += "bg-red-900/60 border-red-500/80 text-red-100";
          } else {
            btnClass += "bg-slate-800/60 border-slate-600 text-slate-400";
          }

          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleChoice(idx)}
                className={btnClass}
                disabled={feedback !== null}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bouton principal rouge type CONTINUE */}
      {feedback === "correct" && (
        <button
          type="button"
          onClick={handleNextQuestion}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition"
        >
          Continuer
        </button>
      )}

      {feedback === "wrong" && (
        <button
          type="button"
          onClick={handleNextTurn}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition"
        >
          Tour suivant
        </button>
      )}
    </div>
  );
}
