import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const CSV_PATHS = [
  path.join(process.cwd(), "public", "questions-import.csv"),
  path.join(process.cwd(), "scripts", "questions-import.csv"),
];

function parseCsvLine(line: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ";" && !inQuotes) {
      parts.push(current.replace(/^"|"$/g, "").trim());
      current = "";
    } else current += ch;
  }
  parts.push(current.replace(/^"|"$/g, "").trim());
  return parts;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.SEED_SECRET;

  if (!expected) {
    return NextResponse.json(
      {
        error: "SEED_SECRET non configuré. Ajoute SEED_SECRET dans .env.local (ex: SEED_SECRET=monMotDePasseSecret).",
      },
      { status: 500 }
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "Secret invalide." }, { status: 403 });
  }

  let csvContent: string;
  let csvPath: string | null = null;
  for (const p of CSV_PATHS) {
    if (fs.existsSync(p)) {
      csvPath = p;
      break;
    }
  }
  if (!csvPath) {
    return NextResponse.json(
      { error: "Fichier questions-import.csv introuvable (public/ ou scripts/)." },
      { status: 500 }
    );
  }
  csvContent = fs.readFileSync(csvPath, "utf8");

  let admin: typeof import("firebase-admin");
  try {
    admin = require("firebase-admin");
  } catch {
    return NextResponse.json(
      { error: "firebase-admin non installé. Lance: npm install firebase-admin" },
      { status: 500 }
    );
  }

  let app = admin.apps[0];
  if (!app) {
    const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const keyPath = path.join(process.cwd(), "scripts", "serviceAccountKey.json");
    if (keyJson) {
      try {
        const key = JSON.parse(keyJson);
        app = admin.initializeApp({ credential: admin.credential.cert(key) });
      } catch (e) {
        return NextResponse.json(
          { error: "FIREBASE_SERVICE_ACCOUNT_JSON invalide (JSON)." },
          { status: 500 }
        );
      }
    } else if (fs.existsSync(keyPath)) {
      const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      app = admin.initializeApp({ credential: admin.credential.cert(key) });
    } else {
      return NextResponse.json(
        {
          error:
            "Clé Firebase manquante. Soit ajoute FIREBASE_SERVICE_ACCOUNT_JSON dans .env.local (contenu JSON du fichier de clé), " +
            "soit place le fichier scripts/serviceAccountKey.json (téléchargé depuis Firebase Console → Paramètres → Comptes de service → Générer une clé).",
        },
        { status: 500 }
      );
    }
  }

  const db = admin.firestore();
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const skipHeader =
    lines[0]?.toLowerCase().startsWith("catégorie") ||
    lines[0]?.toLowerCase().startsWith("category");
  const dataLines = skipHeader ? lines.slice(1) : lines;

  const questions: Array<{
    category: string;
    prompt: string;
    choices: string[];
    answerIndex: number;
    isActive: boolean;
    createdAt: unknown;
    updatedAt: unknown;
  }> = [];
  const categories = ["club", "foot", "culture_locale", "enfants"];

  for (const raw of dataLines) {
    const parts = parseCsvLine(raw);
    if (parts.length < 6) continue;
    const category = parts[0].trim().toLowerCase();
    if (!categories.includes(category)) continue;
    const prompt = parts[1].trim();
    if (!prompt) continue;
    const answerIndex = parseInt(parts[parts.length - 1], 10);
    const choices = parts
      .slice(2, parts.length - 1)
      .map((c) => c.trim())
      .filter(Boolean);
    if (
      choices.length < 3 ||
      choices.length > 4 ||
      isNaN(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= choices.length
    )
      continue;
    questions.push({
      category,
      prompt,
      choices,
      answerIndex,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const coll = db.collection("questions");
  const BATCH_SIZE = 500;
  let created = 0;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = questions.slice(i, i + BATCH_SIZE);
    chunk.forEach((q) => {
      const ref = coll.doc();
      batch.set(ref, q);
      created++;
    });
    await batch.commit();
  }

  return NextResponse.json({
    ok: true,
    message: `${questions.length} questions importées en base.`,
    count: questions.length,
  });
}
