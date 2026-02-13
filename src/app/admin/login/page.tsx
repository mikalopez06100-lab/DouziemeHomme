"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/admin");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password) {
      setErr("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    try {
      await signIn(email.trim(), password);
      // La redirection se fait via useEffect quand user est mis à jour par Firebase
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: string }).code) : "";
      console.error("Erreur connexion admin:", code || msg, e);
      if (msg.includes("auth/invalid-credential") || code === "auth/invalid-credential" || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        setErr("Email ou mot de passe incorrect. Vérifiez que l'utilisateur a bien été créé dans Firebase (Authentication → Utilisateurs → Ajouter un utilisateur).");
      } else if (msg.includes("auth/invalid-email") || code === "auth/invalid-email") {
        setErr("Adresse email invalide.");
      } else if (msg.includes("auth/too-many-requests") || code === "auth/too-many-requests") {
        setErr("Trop de tentatives. Réessayez plus tard.");
      } else if (msg.includes("auth/operation-not-allowed") || code === "auth/operation-not-allowed") {
        setErr("Connexion par email désactivée. Dans Firebase Console : Authentication → Onglet « Connexion » → activez « E-mail/Mot de passe ».");
      } else if (msg.includes("auth/unauthorized-domain") || code === "auth/unauthorized-domain") {
        setErr("Domaine non autorisé. Firebase Console → Authentication → Paramètres → Domaines autorisés → ajoutez l’URL du site (ex. ton-site.vercel.app ou localhost).");
      } else if (msg.includes("auth/user-disabled") || code === "auth/user-disabled") {
        setErr("Ce compte a été désactivé.");
      } else {
        const detail = code ? ` (${code})` : (msg ? ` — ${msg}` : "");
        setErr("Connexion impossible." + detail + " Vérifiez la checklist ci-dessous.");
      }
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4 shadow-xl"
      >
        <h1 className="text-xl font-bold text-white">Admin – Connexion</h1>
        <input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
        />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg"
        >
          Se connecter
        </button>
        <details className="text-xs text-slate-400 mt-4">
          <summary className="cursor-pointer hover:text-slate-300">Connexion impossible ?</summary>
          <ul className="mt-2 list-disc list-inside space-y-1 text-slate-500">
            <li>Firebase Console → <strong>Authentication → Connexion</strong> : activer « E-mail/Mot de passe ».</li>
            <li>Créer l’utilisateur dans <strong>Authentication → Utilisateurs → Ajouter un utilisateur</strong> (email + mot de passe, 6 caractères min).</li>
            <li><strong>Paramètres → Domaines autorisés</strong> : ajouter <code className="bg-slate-800 px-1">localhost</code> (en local) ou ton domaine Vercel (ex. xxx.vercel.app).</li>
            <li>Ouvre la console du navigateur (F12) pour voir le détail de l’erreur Firebase.</li>
          </ul>
        </details>
      </form>
    </main>
  );
}
