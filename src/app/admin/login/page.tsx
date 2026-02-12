"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password) {
      setErr("Veuillez remplir l'email et le mot de passe.");
      return;
    }
    try {
      await signIn(email.trim(), password);
      router.replace("/admin");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        setErr("Email ou mot de passe incorrect.");
      } else if (msg.includes("auth/invalid-email")) {
        setErr("Adresse email invalide.");
      } else if (msg.includes("auth/too-many-requests")) {
        setErr("Trop de tentatives. Réessayez plus tard.");
      } else if (msg.includes("auth/operation-not-allowed") || msg.includes("unauthorized")) {
        setErr("Connexion refusée. Vérifiez que le domaine est autorisé dans Firebase (Authentication → Paramètres → Domaines autorisés).");
      } else {
        setErr(msg || "Connexion impossible. Vérifiez vos identifiants et que le site est autorisé dans Firebase.");
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
      </form>
    </main>
  );
}
