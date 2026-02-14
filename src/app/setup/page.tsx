"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useGameSessionStore } from "@/store/gameSession";
import { LogoDouziemeHomme } from "@/components/LogoDouziemeHomme";

export default function SetupPage() {
  const router = useRouter();
  const initSession = useGameSessionStore((s) => s.initSession);
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState<string[]>(["", ""]);

  const handleCountChange = (value: number) => {
    const clamped = Math.min(6, Math.max(2, value));
    setPlayerCount(clamped);
    setNames((prev) => {
      const copy = [...prev];
      if (copy.length < clamped) {
        while (copy.length < clamped) copy.push("");
      } else if (copy.length > clamped) {
        copy.length = clamped;
      }
      return copy;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validNames = names.map((n, i) => n || `Joueur ${i + 1}`);
    initSession(validNames);
    router.push("/game");
  };

  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <div className="relative flex flex-col flex-1 items-center py-6 px-4 max-w-xl mx-auto">
        <LogoDouziemeHomme className="shrink-0 mb-2" />

        <h1 className="text-2xl font-extrabold uppercase tracking-wide mb-4">
          Paramétrer la partie
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-black/60 rounded-2xl p-4 space-y-4"
        >
          <div>
            <label className="block text-sm mb-2">
              Nombre de joueurs
            </label>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleCountChange(n)}
                  className={`w-12 h-12 rounded-xl font-bold text-lg transition ${
                    playerCount === n
                      ? "bg-red-600 text-white ring-2 ring-red-400"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {Array.from({ length: playerCount }).map((_, idx) => (
              <div key={idx}>
                <label className="block text-xs mb-1">Joueur {idx + 1}</label>
                <input
                  type="text"
                  value={names[idx] ?? ""}
                  onChange={(e) => {
                    const copy = [...names];
                    copy[idx] = e.target.value;
                    setNames(copy);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
                  placeholder={`Nom du joueur ${idx + 1}`}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest transition"
          >
            Démarrer la partie
          </button>
        </form>
      </div>
    </main>
  );
}
