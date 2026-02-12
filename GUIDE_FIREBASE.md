# Guide : configurer Firebase pour Douzième Homme

Suis ces étapes **dans l’ordre**.

---

## Étape 1 : Ouvre Firebase dans ton navigateur

1. Va sur : **https://console.firebase.google.com**
2. Connecte-toi avec ton compte Google si besoin.
3. Clique sur ton projet **« douzieme-homme-le-jeu »** (ou le nom que tu as choisi).

---

## Étape 2 : Ouvre les paramètres du projet

1. En haut à gauche, tu vois **« Aperçu du projet »** avec une **icône engrenage** à côté.
2. Clique sur cette **icône engrenage**.
3. Dans le menu, clique sur **« Paramètres du projet »** (ou **« Project settings »** en anglais).

![Tu es maintenant dans la page des paramètres]

---

## Étape 3 : Trouve ta configuration Web

1. Descends dans la page jusqu’à la section **« Vos applications »** (ou **« Your apps »**).
2. Tu vois une ou plusieurs applications (icône **</>** pour le Web).
3. Si tu n’as **pas encore** d’application Web :
   - Clique sur **« Ajouter une application »** (ou **</>**).
   - Choisis **« Web »** (icône **</>**).
   - Donne un nom, par exemple **« Douzième Homme »**, puis **« Enregistrer l’application »**.
4. Sous ton application Web, tu vois un bloc de code qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "douzieme-homme-le-jeu.firebaseapp.com",
  projectId: "douzieme-homme-le-jeu",
  storageBucket: "douzieme-homme-le-jeu.appspot.com",
  messagingSenderId: "792813670074",
  appId: "1:792813670074:web:57bf53c05b89ea35c5bc83",
  measurementId: "G-..."
};
```

5. **Garde cette page ouverte** : tu vas copier ces valeurs à l’étape 5.

---

## Étape 4 : Ouvre le fichier .env.local dans ton projet

1. Dans **Cursor**, ouvre ton projet **DouziemeHomme**.
2. Dans la liste des fichiers à gauche, va à la **racine** du projet (là où tu vois `package.json`, `src`, etc.).
3. Ouvre le fichier **`.env.local`** (il est à la racine, comme `package.json`).
   - S’il n’existe pas : crée un nouveau fichier et nomme-le exactement **`.env.local`** à la racine.

---

## Étape 5 : Colle tes clés dans .env.local

Dans le fichier **`.env.local`**, tu dois avoir **une ligne par variable**. Remplace la partie **après le `=`** par la valeur qui est dans le bloc `firebaseConfig` (sans guillemets).

Exemple : si dans Firebase tu vois `apiKey: "AIzaSyABC123"`, dans .env.local tu mets :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123
```

Fais pareil pour chaque ligne :

| Dans .env.local | À copier depuis firebaseConfig |
|-----------------|-------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY=` | la valeur de **apiKey** |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=` | la valeur de **authDomain** |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID=` | la valeur de **projectId** |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=` | la valeur de **storageBucket** |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=` | la valeur de **messagingSenderId** |
| `NEXT_PUBLIC_FIREBASE_APP_ID=` | la valeur de **appId** |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=` | la valeur de **measurementId** (optionnel) |

- **Pas d’espace** autour du `=`.
- **Pas de guillemets** autour des valeurs.
- **Une ligne par variable.**

Enregistre le fichier (Ctrl+S).

---

## Étape 6 : Redémarrer l’application

1. Dans un terminal, arrête le serveur s’il tourne (Ctrl+C).
2. Relance : **`npm run dev`**.
3. Ouvre **http://localhost:3000** dans ton navigateur.

Si tout est bon, la page d’accueil s’affiche et Firebase est connecté.

---

## En cas de problème

- **« Invalid API key »** : vérifie que tu as bien collé **apiKey** dans `NEXT_PUBLIC_FIREBASE_API_KEY` sans espace ni guillemet.
- **Fichier .env.local introuvable** : il doit être **à la racine** du projet (même dossier que `package.json`), et s’appeler exactement `.env.local`.
- Après avoir modifié `.env.local`, il faut **toujours** redémarrer `npm run dev`.
