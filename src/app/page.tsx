import Link from "next/link";
import { LogoDouziemeHomme } from "@/components/LogoDouziemeHomme";

export default function HomePage() {
  return (
    <main className="min-h-screen min-h-[100dvh] bg-accueil text-white flex flex-col relative">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" aria-hidden />
      <div className="relative flex-1 flex flex-col items-center justify-between py-6 px-4 sm:py-10 bg-accueil-content">
        <LogoDouziemeHomme className="shrink-0 py-2" />

        <div className="bg-accueil-card shrink-0">
          <section className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
              Bienvenue
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Préparez vos joueurs, choisissez vos catégories et lancez une partie.
            </p>
          </section>

          <section className="mt-6 sm:mt-8 w-full">
            <Link
              href="/setup"
              className="block w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm py-3.5 sm:py-4 px-6 rounded-xl text-center uppercase tracking-widest transition touch-manipulation"
            >
              Commencer une partie
            </Link>
          </section>
        </div>

        <div className="h-6 sm:h-10 shrink-0" aria-hidden />
      </div>
    </main>
  );
}
