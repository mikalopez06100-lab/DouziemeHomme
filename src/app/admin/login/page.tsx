"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function getAuthErrorCode(e: unknown): string {
  if (e && typeof e === "object" && "code" in e && typeof (e as { code: unknown }).code === "string") {
    return (e as { code: string }).code;
  }
  const msg = e instanceof Error ? e.message : String(e ?? "");
  const match = msg.match(/auth\/[a-z-]+/i);
  return match ? match[0] : "";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/admin");
  }, [user, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr("");
    if (!email.trim() || !password) {
      setErr("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    if (password.length < 6) {
      setErr("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Redirection forcée pour que le layout admin voie bien l'utilisateur (évite soucis de timing React)
      window.location.href = "/admin";
      return;
    } catch (e: unknown) {
      const code = getAuthErrorCode(e);
      console.error("Erreur connexion admin:", code, e);
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setErr("Email ou mot de passe incorrect. Vérifiez que l'utilisateur a bien été créé dans Firebase (Authentication → Utilisateurs → Ajouter un utilisateur).");
      } else if (code === "auth/invalid-email") {
        setErr("Adresse email invalide.");
      } else if (code === "auth/too-many-requests") {
        setErr("Trop de tentatives. Réessayez plus tard.");
      } else if (code === "auth/operation-not-allowed") {
        setErr("Connexion par email désactivée. Dans Firebase Console : Authentication → Onglet « Connexion » → activez « E-mail/Mot de passe ».");
      } else if (code === "auth/unauthorized-domain") {
        setErr("Domaine non autorisé. Firebase Console → Authentication → Paramètres → Domaines autorisés → ajoutez l’URL du site (ex. ton-site.vercel.app ou localhost).");
      } else if (code === "auth/user-disabled") {
        setErr("Ce compte a été désactivé.");
      } else if (code === "auth/network-request-failed") {
        setErr("Erreur réseau. Vérifiez votre connexion et réessayez.");
      } else {
        const raw = e instanceof Error ? e.message : String(e ?? "");
        setErr("Connexion impossible. " + (code ? "Code : " + code + ". " : "") + (raw ? " Détail : " + raw : "") + " Vérifiez la checklist ci-dessous.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}
        className="relative z-10 w-full max-w-sm bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4 shadow-xl"
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
          type="button"
          disabled={loading}
          onClick={() => handleSubmit()}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold py-2 rounded-lg cursor-pointer touch-manipulation"
        >
          {loading ? "Connexion…" : "Se connecter"}
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
