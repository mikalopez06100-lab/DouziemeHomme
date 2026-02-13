import type { QuestionCategory } from "@/types/categories";
import type { Question } from "@/types/game";

const CATEGORIES: QuestionCategory[] = [
  "enfants",
  "culture_locale",
  "foot",
  "club",
];

export interface ImportRow {
  category: QuestionCategory;
  prompt: string;
  choices: string[];
  answerIndex: number;
}

export interface ImportResult {
  ok: ImportRow[];
  errors: { line: number; raw: string; message: string }[];
}

/**
 * Parse CSV d'import : une question par ligne.
 * Format : catégorie;énoncé;réponse1;réponse2;réponse3;[réponse4];bonne_réponse
 * - catégorie = enfants | culture_locale | foot | club
 * - bonne_réponse = index (0 à 3) OU texte exact de la bonne réponse
 * Séparateur : point-virgule (;). Les guillemets permettent d'échapper les ; dans le texte.
 */
export function parseImportCsv(csv: string): ImportResult {
  const ok: ImportRow[] = [];
  const errors: { line: number; raw: string; message: string }[] = [];
  const rawLines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const skipHeader = rawLines[0]?.toLowerCase().startsWith("catégorie") || rawLines[0]?.toLowerCase().startsWith("category");
  const lines = skipHeader ? rawLines.slice(1) : rawLines;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + (skipHeader ? 2 : 1);
    const raw = lines[i];
    const parts = parseCsvLine(raw);
    if (parts.length < 6) {
      errors.push({
        line: lineNum,
        raw,
        message: "Format : catégorie;énoncé;réponse1;réponse2;réponse3;bonne_réponse (ou +réponse4 pour 4 choix).",
      });
      continue;
    }
    const [catRaw, prompt, ...rest] = parts;
    if (rest.length < 4) {
      errors.push({
        line: lineNum,
        raw,
        message: "Au moins 4 colonnes après l'énoncé : réponse1;réponse2;réponse3;bonne_réponse (ou 5 colonnes pour 4 réponses).",
      });
      continue;
    }
    const category = catRaw.trim().toLowerCase() as QuestionCategory;
    if (!CATEGORIES.includes(category)) {
      errors.push({
        line: lineNum,
        raw,
        message: `Catégorie invalide : "${catRaw}". Utiliser : ${CATEGORIES.join(", ")}`,
      });
      continue;
    }
    const promptTrim = prompt.trim();
    if (!promptTrim) {
      errors.push({ line: lineNum, raw, message: "Énoncé vide." });
      continue;
    }
    const last = rest[rest.length - 1].trim();
    const isNumericAnswer = /^[0-3]$/.test(last);
    let choices: string[];
    let answerIndex: number;
    if (isNumericAnswer) {
      choices = rest.slice(0, -1).map((c) => c.trim()).filter(Boolean);
      answerIndex = parseInt(last, 10);
    } else {
      choices = rest.map((c) => c.trim()).filter(Boolean);
      const idx = choices.findIndex((c) => c === last);
      if (idx === -1) {
        errors.push({
          line: lineNum,
          raw,
          message: `La bonne réponse "${last}" ne figure pas dans les choix.`,
        });
        continue;
      }
      answerIndex = idx;
    }
    if (choices.length < 3 || choices.length > 4) {
      errors.push({
        line: lineNum,
        raw,
        message: "Il faut 3 ou 4 réponses.",
      });
      continue;
    }
    if (answerIndex < 0 || answerIndex >= choices.length) {
      errors.push({ line: lineNum, raw, message: "Index de bonne réponse invalide (0 à " + (choices.length - 1) + ")." });
      continue;
    }
    ok.push({ category, prompt: promptTrim, choices, answerIndex });
  }

  return { ok, errors };
}

function parseCsvLine(line: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ";" && !inQuotes) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((p) => p.replace(/^"|"$/g, "").trim());
}

/**
 * Convertit une ligne parsée en objet Question (sans id, pour createQuestion).
 */
export function importRowToQuestion(row: ImportRow): Omit<Question, "id"> {
  return {
    category: row.category,
    prompt: row.prompt,
    choices: row.choices,
    answerIndex: row.answerIndex,
    isActive: true,
  };
}
