const fs = require("fs");
const path = require("path");

const desktop = path.join(process.env.USERPROFILE, "Desktop");
const dirs = fs.readdirSync(desktop, { withFileTypes: true }).filter((d) => d.isDirectory());
const homme = dirs.find((d) => d.name.includes("douzi") && d.name.includes("Homme"));
if (!homme) {
  console.error("Dossier 'Le douzième Homme' introuvable sur le Bureau.");
  process.exit(1);
}
const cartes = path.join(desktop, homme.name, "cartes");
const files = fs.readdirSync(cartes);
const pdf = files.find((f) => f.includes("verso") && f.includes("MAJ") && f.endsWith(".pdf"));
if (!pdf) {
  console.error("PDF 'base verso-MAJ copie.pdf' introuvable dans cartes/");
  process.exit(1);
}
const src = path.join(cartes, pdf);
const dest = path.join(__dirname, "base-verso.pdf");
fs.copyFileSync(src, dest);
console.log("Copié:", dest);
