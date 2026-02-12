"use client";

import { useState, useEffect } from "react";
import type { Question } from "@/types/game";
import type { QuestionCategory } from "@/types/categories";
import { CATEGORY_UI } from "@/types/categories";

const CATEGORIES: QuestionCategory[] = [
  "club",
  "foot",
  "culture_locale",
  "enfants",
];

interface QuestionFormProps {
  initial?: Question;
  onSave: (data: Omit<Question, "id"> | Partial<Question>) => void;
  onCancel: () => void;
}

export function QuestionForm({ initial, onSave, onCancel }: QuestionFormProps) {
  const [category, setCategory] = useState<QuestionCategory>("club");
  const [prompt, setPrompt] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setCategory(initial.category);
      setPrompt(initial.prompt);
      setChoices(
        initial.choices.length >= 3 && initial.choices.length <= 4
          ? [...initial.choices]
          : ["", "", ""]
      );
      setAnswerIndex(
        Math.min(
          Math.max(0, initial.answerIndex),
          (initial.choices.length || 1) - 1
        )
      );
      setIsActive(initial.isActive !== false);
    }
  }, [initial]);

  const validChoices = choices.filter((c) => c.trim().length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!prompt.trim()) {
      setError("L'énoncé est obligatoire.");
      return;
    }
    if (validChoices.length < 3 || validChoices.length > 4) {
      setError("Il faut 3 ou 4 réponses.");
      return;
    }
    const correctInRange =
      answerIndex >= 0 && answerIndex < validChoices.length;
    if (!correctInRange) {
      setError("La réponse correcte doit être l'un des choix.");
      return;
    }

    if (initial) {
      onSave({
        category,
        prompt: prompt.trim(),
        choices: validChoices,
        answerIndex,
        isActive,
      });
    } else {
      onSave({
        category,
        prompt: prompt.trim(),
        choices: validChoices,
        answerIndex,
        isActive,
      });
    }
  };

  const addChoice = () => {
    if (choices.length < 4) setChoices((c) => [...c, ""]);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 3) return;
    setChoices((c) => c.filter((_, i) => i !== index));
    if (answerIndex >= choices.length - 1)
      setAnswerIndex(Math.max(0, choices.length - 2));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Catégorie</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as QuestionCategory)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_UI[c].label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">Énoncé</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white resize-y"
          placeholder="Question..."
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Réponses (3 ou 4)
        </label>
        {choices.map((choice, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={choice}
              onChange={(e) => {
                const c = [...choices];
                c[idx] = e.target.value;
                setChoices(c);
              }}
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              placeholder={`Choix ${idx + 1}`}
            />
            <label className="flex items-center gap-1 text-sm text-slate-300 shrink-0">
              <input
                type="radio"
                name="answer"
                checked={answerIndex === idx}
                onChange={() => setAnswerIndex(idx)}
              />
              Correcte
            </label>
            {choices.length > 3 && (
              <button
                type="button"
                onClick={() => removeChoice(idx)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {choices.length < 4 && (
          <button
            type="button"
            onClick={addChoice}
            className="text-sm text-slate-400 hover:text-white"
          >
            + Ajouter un choix
          </button>
        )}
      </div>

      {initial && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive" className="text-sm text-slate-300">
            Question active (visible en jeu)
          </label>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-medium"
        >
          {initial ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded font-medium"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
