"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const STORAGE_KEY = "douzieme-homme-install-prompt";
const HIDE_DAYS = 7;

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { hideUntil } = JSON.parse(raw);
    return hideUntil ? Date.now() < hideUntil : false;
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    const hideUntil = Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ hideUntil }));
  } catch {}
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!isMobile() || isStandalone() || wasDismissedRecently()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const ev = e as unknown as { prompt: () => Promise<void> };
      if (typeof ev.prompt === "function") setDeferredPrompt({ prompt: () => ev.prompt() });
    };
    window.addEventListener("beforeinstallprompt", handler);

    const timer = setTimeout(() => setVisible(true), 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setShowIosInstructions(false);
    setDismissed();
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setVisible(false);
      setDismissed();
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setShowIosInstructions(true);
    } else {
      handleClose();
    }
  };

  if (!visible) return null;

  const isIos = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="install-title"
      aria-modal="true"
    >
      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-douzieme-homme.png"
              alt="Douzième Homme"
              width={160}
              height={92}
              className="w-40 h-auto object-contain"
            />
          </div>
          <h2 id="install-title" className="text-lg font-bold text-white mb-2">
            Ajouter à l&apos;écran d&apos;accueil
          </h2>
          <p className="text-sm text-slate-300 mb-4">
            {showIosInstructions
              ? "Sur Safari : touchez le bouton Partager puis « Sur l’écran d’accueil »."
              : "Installez le raccourci pour un accès rapide au quiz."}
          </p>
          {showIosInstructions ? (
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl"
            >
              Compris
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl text-slate-300 hover:text-white border border-slate-500"
              >
                Plus tard
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl"
              >
                {deferredPrompt ? "Installer" : isIos ? "Voir comment" : "Ajouter"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
