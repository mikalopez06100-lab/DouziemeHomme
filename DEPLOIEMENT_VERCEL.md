# Déploiement sur Vercel – Douzième Homme

## 1. Pousser le code sur GitHub

Le dépôt Git local a déjà un commit sur la branche **main**. Il faut maintenant créer le dépôt sur GitHub et pousser.

1. Va sur **[github.com/new](https://github.com/new)**.
2. Choisis un nom (ex. **douzieme-homme**).
3. **Ne coche pas** "Add a README" ni "Initialize with .gitignore" (le dépôt doit rester vide).
4. Clique sur **Create repository**.

5. Dans ton terminal, à la racine du projet `DouziemeHomme`, exécute *(remplace `TON_UTILISATEUR` par ton nom d’utilisateur GitHub)* :

```bash
git remote add origin https://github.com/TON_UTILISATEUR/douzieme-homme.git
git push -u origin main
```

Si le dépôt GitHub a un autre nom que `douzieme-homme`, adapte l’URL en conséquence.

*(Le fichier `.env.local` n’est pas versionné : il est dans `.gitignore`.)*

---

## 2. Créer le projet sur Vercel

1. Va sur **[vercel.com](https://vercel.com)** et connecte-toi (avec GitHub).
2. Clique sur **Add New…** → **Project**.
3. **Import** le dépôt **douzieme-homme** (ou le nom de ton repo).
4. Vercel détecte Next.js ; ne change rien au **Framework Preset** ni au **Root Directory**.
5. **Ne déploie pas tout de suite** : on va d’abord ajouter les variables d’environnement.

---

## 3. Variables d’environnement (Firebase)

Dans l’écran de création du projet Vercel :

1. Ouvre la section **Environment Variables**.
2. Saisis **chaque variable** (comme dans ton `.env.local`) :

| Name | Value (à copier depuis .env.local) |
|------|-----------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ta clé API |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ton auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ton project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ton storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ton sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ton app id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (optionnel) measurement id |

Coche **Production**, **Preview** et **Development** pour chaque variable.

3. Clique sur **Deploy**.

---

## 4. Après le déploiement

- L’app sera accessible à l’URL fournie par Vercel (ex. `douzieme-homme.vercel.app`).
- Pour que **Firebase Auth** accepte ce domaine :  
  **Console Firebase** → **Authentication** → **Settings** → **Authorized domains** → ajoute ton domaine Vercel (ex. `douzieme-homme.vercel.app`).

---

## 5. Mises à jour

À chaque **push** sur la branche connectée (souvent `main`), Vercel redéploie automatiquement.

---

## Dépannage

- **Build échoue** : vérifie les logs dans l’onglet **Deployments** sur Vercel.
- **Erreur Firebase en prod** : vérifie que toutes les variables `NEXT_PUBLIC_*` sont bien renseignées dans **Project Settings** → **Environment Variables**, et que le domaine Vercel est dans les domaines autorisés Firebase.
- **Impossible de se connecter à l’admin** (en prod) :
  1. **Domaines autorisés** : [Console Firebase](https://console.firebase.google.com) → ton projet → **Authentication** → **Settings** (Paramètres) → **Authorized domains** (Domaines autorisés). Ajoute **exactement** le domaine de ton app (ex. `ton-projet.vercel.app` **sans** `https://`). Sans cela, Firebase refuse la connexion.
  2. **Utilisateur existant** : l’email/mot de passe doivent correspondre à un utilisateur créé dans **Authentication** → **Users** → **Add user**.
  3. En local : vérifie que `.env.local` est bien rempli et que tu as redémarré `npm run dev` après modification.
- **Code NOT_FOUND (404)** :
  1. **Root Directory** : dans **Settings** → **General**, le champ **Root Directory** doit être **vide** (ne pas mettre de chemin). Si un dossier est indiqué, Vercel cherche l’app au mauvais endroit.
  2. **Framework** : **Framework Preset** doit être **Next.js** (pas "Other").
  3. **Build** : dans **Deployments**, ouvre le dernier déploiement et vérifie que le **build** est vert (réussi). Si le build échoue, le déploiement peut afficher NOT_FOUND.
  4. **URL** : ouvre bien l’URL du déploiement (ex. `https://ton-projet.vercel.app`) et non une URL de preview ou un ancien lien.
