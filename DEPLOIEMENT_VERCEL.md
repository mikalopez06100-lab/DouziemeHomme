# Déploiement sur Vercel – Douzième Homme

## 1. Pousser le code sur GitHub

Si ce n’est pas déjà fait :

```bash
git init
git add .
git commit -m "Initial commit - Douzième Homme"
```

Crée un dépôt sur [github.com](https://github.com) (ex. `douzieme-homme`), puis :

```bash
git remote add origin https://github.com/TON_UTILISATEUR/douzieme-homme.git
git branch -M main
git push -u origin main
```

*(Ne committe jamais `.env.local` : il est dans `.gitignore`.)*

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
