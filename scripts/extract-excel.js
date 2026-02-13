const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Trouve le fichier Excel sur le Bureau (même logique que copy-pdf)
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
const sheetNames = workbook.SheetNames;
console.log("Feuilles:", sheetNames.join(", "));

for (const name of sheetNames) {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  console.log("\n--- Feuille:", name, "---");
  console.log("Lignes:", data.length);
  if (data.length > 0) {
    console.log("Aperçu (10 premières lignes):");
    data.slice(0, 10).forEach((row, i) => console.log(i + 1, JSON.stringify(row)));
    // Catégories distinctes
    const categories = new Set();
    let lastCat = "";
    data.forEach((row, idx) => {
      const cat = (row[0] || "").toString().trim();
      if (cat) lastCat = cat;
      if (lastCat) categories.add(lastCat);
    });
    console.log("\nCatégories trouvées:", [...categories]);
  }
}
