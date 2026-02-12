"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchAllQuestions,
  createQuestion,
  updateQuestion,
  toggleQuestionActive,
  deleteQuestion,
} from "@/lib/questionRepository";
import { useAuth } from "@/contexts/AuthContext";
import type { Question } from "@/types/game";
import type { QuestionCategory } from "@/types/categories";
import { CATEGORY_UI } from "@/types/categories";
import { QuestionForm } from "@/components/admin/QuestionForm";

const CATEGORIES: QuestionCategory[] = [
  "club",
  "foot",
  "culture_locale",
  "enfants",
];

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | "">(
    ""
  );
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAllQuestions(categoryFilter || undefined);
      setQuestions(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = questions.filter((q) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      q.prompt.toLowerCase().includes(s) ||
      q.choices.some((c) => c.toLowerCase().includes(s))
    );
  });

  const handleCreate = async (
    data: Omit<Question, "id"> | Partial<Question>
  ) => {
    await createQuestion(data as Omit<Question, "id">);
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (id: string, data: Partial<Question>) => {
    await updateQuestion(id, data);
    setEditingId(null);
    load();
  };

  const handleToggle = async (id: string) => {
    await toggleQuestionActive(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    await deleteQuestion(id);
    load();
  };

  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative p-4 md:p-6">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <div className="relative max-w-4xl mx-auto w-full flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              ← Accueil
            </Link>
            <h1 className="text-2xl font-bold">Admin – Questions</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as QuestionCategory | "")
            }
            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_UI[c].label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Rechercher (énoncé ou réponses)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-medium"
          >
            + Nouvelle question
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">Chargement…</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((q) => (
              <li
                key={q.id}
                className={`bg-slate-800 rounded-xl p-4 border ${
                  q.isActive
                    ? "border-slate-600"
                    : "border-amber-600/50 opacity-75"
                }`}
              >
                {editingId === q.id ? (
                  <QuestionForm
                    initial={q}
                    onSave={(data) => handleUpdate(q.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-400 uppercase mr-2">
                          {CATEGORY_UI[q.category].label}
                        </span>
                        <p className="font-medium text-white">{q.prompt}</p>
                        <ul className="mt-1 text-sm text-slate-300 list-disc list-inside">
                          {q.choices.map((c, i) => (
                            <li key={i}>
                              {c}
                              {i === q.answerIndex && (
                                <span className="text-emerald-400 ml-1">✓</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggle(q.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            q.isActive
                              ? "bg-amber-600/20 text-amber-400"
                              : "bg-emerald-600/20 text-emerald-400"
                          }`}
                        >
                          {q.isActive ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(q.id)}
                          className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-2 py-1 rounded"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {filtered.length === 0 && !loading && (
          <p className="text-slate-400 py-8 text-center">
            Aucune question.
            {categoryFilter || search ? " Modifier les filtres." : ""}
          </p>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-10">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nouvelle question</h2>
            <QuestionForm
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
