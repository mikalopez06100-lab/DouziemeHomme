const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const admin = require("firebase-admin");

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "douzieme-homme-le-jeu";
const csvPath = path.join(__dirname, "questions-import.csv");

function parseCsvLine(line) {
  const parts = [];
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

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error("Fichier introuvable:", csvPath);
    process.exit(1);
  }

  let app = admin.apps[0];
  if (!app) {
    const keyPath = path.join(__dirname, "serviceAccountKey.json");
    if (fs.existsSync(keyPath)) {
      const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      app = admin.initializeApp({ credential: admin.credential.cert(key) });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      app = admin.initializeApp({ credential: admin.credential.applicationDefault() });
    } else {
      console.error("\nPour l'import direct, il faut une clé de compte de service Firebase :");
      console.error("1. Firebase Console → Paramètres du projet → Comptes de service");
      console.error("2. Générer une nouvelle clé privée (JSON)");
      console.error("3. Enregistrer le fichier sous : scripts/serviceAccountKey.json");
      console.error("\nSinon, fais l'import depuis l'admin : Admin → Import en masse → « Importer les 355 questions (export Excel) ».\n");
      process.exit(1);
    }
  }
  const db = admin.firestore();

  const csv = fs.readFileSync(csvPath, "utf8");
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const skipHeader = lines[0] && (lines[0].toLowerCase().startsWith("catégorie") || lines[0].toLowerCase().startsWith("category"));
  const dataLines = skipHeader ? lines.slice(1) : lines;

  const questions = [];
  for (const raw of dataLines) {
    const parts = parseCsvLine(raw);
    if (parts.length < 6) continue;
    const category = parts[0].trim().toLowerCase();
    if (!["club", "foot", "culture_locale", "enfants"].includes(category)) continue;
    const prompt = parts[1].trim();
    if (!prompt) continue;
    const answerIndex = parseInt(parts[parts.length - 1], 10);
    const choices = parts.slice(2, parts.length - 1).map((c) => c.trim()).filter(Boolean);
    if (choices.length < 3 || choices.length > 4 || isNaN(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) continue;
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

  console.log("Import de", questions.length, "questions…");
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
    console.log(created, "/", questions.length);
  }
  console.log("Terminé.", questions.length, "questions importées.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
