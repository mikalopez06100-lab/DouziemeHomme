/**
 * Upload l'image de fond (stade) vers Firebase Storage et affiche l'URL publique.
 * Usage: node scripts/upload-fond-accueil.js [chemin-vers-image.png]
 * Par défaut utilise public/fond-accueil.png
 *
 * Prérequis:
 * 1. Activer Storage dans Firebase Console → Build → Storage → Get started
 * 2. scripts/serviceAccountKey.json (Paramètres projet → Comptes de service → Générer clé)
 * 3. Règles Storage : autoriser lecture sur images/ (voir storage.rules)
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const admin = require("firebase-admin");

const DEFAULT_IMAGE = path.join(__dirname, "..", "public", "fond-accueil.png");
const STORAGE_PATH = "images/fond-accueil.png";

async function main() {
  const imagePath = process.argv[2] || DEFAULT_IMAGE;
  if (!fs.existsSync(imagePath)) {
    console.error("Fichier introuvable:", imagePath);
    console.error("Usage: node scripts/upload-fond-accueil.js [chemin-vers-image.png]");
    process.exit(1);
  }

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!storageBucket) {
    console.error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET manquant dans .env.local");
    process.exit(1);
  }

  let app = admin.apps[0];
  if (!app) {
    const keyPath = path.join(__dirname, "serviceAccountKey.json");
    const options = { credential: null, storageBucket };
    if (fs.existsSync(keyPath)) {
      const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
      options.credential = admin.credential.cert(key);
      app = admin.initializeApp(options);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      options.credential = admin.credential.applicationDefault();
      app = admin.initializeApp(options);
    } else {
      console.error("\nIl faut une clé de compte de service Firebase :");
      console.error("1. Firebase Console → Paramètres du projet → Comptes de service");
      console.error("2. Générer une nouvelle clé privée (JSON)");
      console.error("3. Enregistrer sous : scripts/serviceAccountKey.json\n");
      process.exit(1);
    }
  }

  const bucket = admin.storage().bucket(storageBucket);
  if (!bucket) {
    console.error("Storage non configuré. Vérifie que le bucket est défini (storageBucket dans la config Firebase).");
    process.exit(1);
  }

  try {
    const [file] = await bucket.upload(imagePath, {
      destination: STORAGE_PATH,
      metadata: { contentType: "image/png" },
      public: true,
    });
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    console.log("\nImage uploadée vers Firebase Storage.");
    console.log("URL publique (à mettre dans .env.local et Vercel) :\n");
    console.log("NEXT_PUBLIC_FOND_ACCUEIL_URL=" + publicUrl);
    console.log("\nDans Firebase Console → Storage → Règles, assure-toi d'autoriser la lecture :");
    console.log('  match /images/{allPaths=**} { allow read; }\n');
  } catch (e) {
    console.error("Erreur upload:", e.message);
    process.exit(1);
  }
}

main();
