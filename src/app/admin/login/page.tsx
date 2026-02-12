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
    try {
      await signIn(email, password);
      router.replace("/admin");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Connexion impossible");
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
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
        />
        <input
          type="password"
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
