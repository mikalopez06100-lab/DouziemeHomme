# Import direct des 355 questions (CLI)

Pour importer les questions **sans passer par l’interface admin**, utilise le script qui écrit directement dans Firestore avec Firebase Admin.

## 1. Clé de compte de service

1. Ouvre [Firebase Console](https://console.firebase.google.com) → ton projet **Douzième Homme**.
2. Icône engrenage → **Paramètres du projet** → onglet **Comptes de service**.
3. Clique sur **Générer une nouvelle clé privée** (ou « Generate new private key »).
4. Enregistre le fichier JSON téléchargé sous :
   ```
   DouziemeHomme/scripts/serviceAccountKey.json
   ```
   (Ce fichier est dans `.gitignore`, il ne sera pas versionné.)

## 2. Lancer l’import

À la racine du projet :

```bash
npm run seed-questions
```

Le script lit `scripts/questions-import.csv` et crée les 355 questions dans la collection Firestore `questions`.

## Alternative (sans clé)

Depuis l’app : **Admin** → **Import en masse** → bouton **« Importer les 355 questions (export Excel) »** (il faut être connecté).
