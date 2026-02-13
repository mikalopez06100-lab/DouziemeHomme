const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const pdfPath = process.argv[2] || path.join(process.env.USERPROFILE || "", "Desktop", "Le douzi\u00e8me Homme", "cartes", "base verso-MAJ copie.pdf");

async function main() {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  console.log("--- RAW TEXT (first 15000 chars) ---\n");
  console.log(data.text.slice(0, 15000));
  console.log("\n--- END ---");
  console.log("Total pages:", data.numpages);
  console.log("Total chars:", data.text.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
