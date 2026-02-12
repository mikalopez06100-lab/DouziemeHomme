import { getApps, initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let _auth: Auth | undefined;
let _db: Firestore | undefined;

function getFirebase(): { auth: Auth; db: Firestore } {
  if (typeof window === "undefined") {
    throw new Error("Firebase is only available on the client.");
  }
  if (_auth && _db) return { auth: _auth, db: _db };

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Clé Firebase manquante. Vérifie que .env.local existe à la racine du projet, " +
        "contient NEXT_PUBLIC_FIREBASE_API_KEY=ta_cle, et redémarre avec npm run dev."
    );
  }

  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim(),
  };

  const app: FirebaseApp =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : (getApps()[0] as FirebaseApp);

  _auth = getAuth(app);
  _db = getFirestore(app);
  return { auth: _auth, db: _db };
}

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return getFirebase().auth[prop as keyof Auth];
  },
});

/** Retourne l'instance Firestore réelle (requise par collection(), doc(), etc.). */
export function getDb(): Firestore {
  return getFirebase().db;
}
