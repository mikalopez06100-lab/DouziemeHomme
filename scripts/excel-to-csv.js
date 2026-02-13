const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Mapping des catégories Excel -> app
const CAT_MAP = {
  club: "club",
  local: "culture_locale",
  football: "foot",
  débutant: "enfants",
  enfants: "enfants",
  foot: "foot",
  "culture locale": "culture_locale",
  "culture_locale": "culture_locale",
};

function normalizeCategory(val) {
  if (!val || typeof val !== "string") return null;
  const key = val.trim().toLowerCase();
  return CAT_MAP[key] || null;
}

/**
 * Parse "A. xxx B. xxx (bonne réponse) C. xxx" ou "A xxx B xxx (bonne reponse) C xxx" -> { choices, answerIndex }
 */
function parseChoices(cell) {
  const str = (cell || "").toString().trim();
  if (!str) return { choices: [], answerIndex: 0 };

  // Essayer d'abord avec point (A. B. C. D.) puis sans point (A B C D)
  const splitRegex = /\s+[B-D][\.)]?\s+/i;
  let partsRaw = str.split(splitRegex);
  if (partsRaw.length < 3 || partsRaw.length > 4) {
    partsRaw = str.split(/\s+[B-D]\s+/i);
  }

  let answerIndex = 0;
  const choices = partsRaw.map((p, i) => {
    const cleaned = (i === 0 ? p.replace(/^[A-D][\.)]?\s*/i, "") : p).trim();
    if (/\(bonne réponse/i.test(cleaned) || /\(bonne reponse\)/i.test(cleaned)) answerIndex = i;
    return cleaned
      .replace(/\s*\(bonne réponse[^)]*\)\s*/gi, "")
      .replace(/\s*\(bonne reponse\)\s*/gi, "")
      .trim();
  }).filter(Boolean);

  if (choices.length < 3 || choices.length > 4) {
    return { choices: [], answerIndex: 0 };
  }
  return { choices, answerIndex };
}

function escapeCsv(val) {
  const s = String(val ?? "").trim();
  if (s.includes(";") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Fichier source
const desktop = path.join(process.env.USERPROFILE, "Desktop");
const dirs = fs.readdirSync(desktop, { withFileTypes: true }).filter((d) => d.isDirectory());
const homme = dirs.find((d) => d.name.includes("douzi") && d.name.includes("Homme"));
const excelPath = homme
  ? path.join(desktop, homme.name, "questions appli.xlsx")
  : path.join(desktop, "questions appli.xlsx");

if (!fs.existsSync(excelPath)) {
  console.error("Fichier introuvable:", excelPath);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

const csvLines = ["catégorie;énoncé;réponse1;réponse2;réponse3;bonne_réponse"];
let lastCategory = "";
let ok = 0;
let skip = 0;
const errors = [];

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const rawCat = (row[0] || "").toString().trim();
  const question = (row[1] || "").toString().trim();
  const choixCell = row[2];

  if (rawCat.toLowerCase() === "categorie" || !question) continue;

  const category = normalizeCategory(rawCat) || (lastCategory ? normalizeCategory(lastCategory) : null);
  if (rawCat) lastCategory = rawCat;
  if (!category) {
    skip++;
    continue;
  }

  const { choices, answerIndex } = parseChoices(choixCell);
  if (choices.length < 3 || choices.length > 4) {
    errors.push({ line: i + 1, question: question.slice(0, 50), msg: "Choix invalides (3 ou 4 attendus)" });
    skip++;
    continue;
  }

  const answerPart = answerIndex; // index 0-3
  const rowCsv = [
    category,
    question,
    ...choices,
    String(answerPart),
  ].map(escapeCsv).join(";");
  csvLines.push(rowCsv);
  ok++;
}

const outPath = path.join(__dirname, "questions-import.csv");
fs.writeFileSync(outPath, "\uFEFF" + csvLines.join("\n"), "utf8"); // BOM for Excel

console.log("Export terminé.");
console.log("Questions exportées:", ok);
console.log("Lignes ignorées / erreurs:", skip);
if (errors.length > 0) {
  console.log("Détail des erreurs (max 15):");
  errors.slice(0, 15).forEach((e) => console.log("  Ligne", e.line, ":", e.msg, "-", e.question));
}
console.log("Fichier CSV généré:", outPath);
console.log("\nTu peux importer ce fichier depuis l'admin : Import en masse → Choisir un fichier CSV → Prévisualiser → Créer les questions.");
