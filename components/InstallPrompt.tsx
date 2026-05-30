"use client";

import { useEffect, useState } from "react";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIP);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!evt || dismissed) return null;

  return (
    <div className="fixed bottom-24 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-xs bg-ink text-white rounded-xl shadow-lg p-3 z-20 text-sm flex gap-3 items-start">
      <div className="flex-1">
        <strong className="block">Install Amanz&apos; Alert</strong>
        <span className="text-white/70 text-xs">Add to home screen — opens like an app, works offline.</span>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => evt.prompt()}
          className="bg-amanzi-500 hover:bg-amanzi-600 rounded px-3 py-1 text-xs font-medium"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white text-xs"
        >
          Later
        </button>
      </div>
    </div>
  );
}
