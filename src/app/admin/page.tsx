"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  parseImportCsv,
  importRowToQuestion,
} from "@/lib/importQuestions";

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
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<{
    ok: number;
    errors: { line: number; raw: string; message: string }[];
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState<{ created: number; failed: number } | null>(null);
  const [importExcelLoading, setImportExcelLoading] = useState(false);
  const [importExcelProgress, setImportExcelProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      await updateQuestion(id, data);
      setEditingId(null);
      load();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement. Vérifiez la console (F12).");
    }
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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result ?? ""));
      setImportPreview(null);
      setImportDone(null);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const handleParsePreview = () => {
    const { ok, errors } = parseImportCsv(importText);
    setImportPreview({ ok: ok.length, errors });
  };

  const handleConfirmImport = async () => {
    const { ok, errors } = parseImportCsv(importText);
    if (ok.length === 0) return;
    setImporting(true);
    setImportDone(null);
    let created = 0;
    let failed = 0;
    for (const row of ok) {
      try {
        await createQuestion(importRowToQuestion(row));
        created++;
      } catch {
        failed++;
      }
    }
    setImportDone({ created, failed });
    setImporting(false);
    load();
  };

  const handleImportExcelPack = async () => {
    if (!confirm("Importer les 355 questions exportées de l’Excel ? Cela va les ajouter à la base.")) return;
    setImportExcelLoading(true);
    setImportExcelProgress({ current: 0, total: 355 });
    setImportDone(null);
    let created = 0;
    let failed = 0;
    try {
      const res = await fetch("/questions-import.csv");
      const csv = await res.text();
      const { ok } = parseImportCsv(csv);
      const BATCH = 10;
      for (let i = 0; i < ok.length; i += BATCH) {
        const batch = ok.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map((row) => createQuestion(importRowToQuestion(row)))
        );
        results.forEach((r) => (r.status === "fulfilled" ? created++ : failed++));
        setImportExcelProgress({ current: Math.min(i + BATCH, ok.length), total: ok.length });
      }
      setImportDone({ created, failed });
      load();
    } catch (e) {
      console.error(e);
      setImportDone({ created: 0, failed: 355 });
    } finally {
      setImportExcelLoading(false);
      setImportExcelProgress(null);
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative p-4 md:p-6">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <div className="relative max-w-4xl mx-auto w-full flex-1">
        {/* Bandeau Import en masse — tout en haut, très visible */}
        <section
          className="mb-6 rounded-xl p-4 border-2 border-amber-400 bg-amber-500/20"
          style={{ boxShadow: "0 0 0 2px rgba(251,191,36,0.5)" }}
          aria-label="Import en masse"
        >
          <h2 className="text-xl font-bold mb-2 text-amber-200">Import en masse</h2>
          <button
            type="button"
            onClick={handleImportExcelPack}
            disabled={importExcelLoading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold px-5 py-2.5 rounded-lg text-base"
          >
            {importExcelLoading && importExcelProgress
              ? `Import… ${importExcelProgress.current}/${importExcelProgress.total}`
              : "Importer les 355 questions (export Excel)"}
          </button>
          <p className="text-sm text-slate-300 mt-2">Ou :</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleImportFile} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-sm">
              Fichier CSV
            </button>
            <button type="button" onClick={handleParsePreview} disabled={!importText.trim()} className="bg-slate-600 hover:bg-slate-500 disabled:opacity-50 px-3 py-1.5 rounded text-sm">
              Prévisualiser
            </button>
            {importPreview && importPreview.ok > 0 && (
              <button type="button" onClick={handleConfirmImport} disabled={importing} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded text-sm font-medium">
                {importing ? "Import…" : `Créer ${importPreview.ok} question(s)`}
              </button>
            )}
          </div>
          <textarea
            placeholder="Coller un CSV ici (catégorie;énoncé;réponse1;réponse2;réponse3;bonne_réponse)"
            value={importText}
            onChange={(e) => { setImportText(e.target.value); setImportPreview(null); setImportDone(null); }}
            className="w-full h-20 mt-2 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm font-mono resize-y"
          />
          {importPreview && <p className="mt-1 text-sm text-slate-300">{importPreview.ok} valide(s). {importPreview.errors.length > 0 && `${importPreview.errors.length} erreur(s).`}</p>}
          {importDone && <p className="mt-1 text-emerald-400 font-medium">Terminé : {importDone.created} créée(s), {importDone.failed} échec(s).</p>}
        </section>

        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              ← Accueil
            </Link>
            <h1 className="text-2xl font-bold">Admin – Questions</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button type="button" onClick={() => signOut()} className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded">
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

        {importPreview && importPreview.errors.length > 0 && (
          <ul className="mb-4 text-red-300 text-sm list-disc list-inside">
            {importPreview.errors.slice(0, 5).map((e, i) => (
              <li key={i}>Ligne {e.line} : {e.message}</li>
            ))}
            {importPreview.errors.length > 5 && (
              <li>… et {importPreview.errors.length - 5} autre(s) erreur(s)</li>
            )}
          </ul>
        )}

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
