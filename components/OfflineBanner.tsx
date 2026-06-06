"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [justFlushed, setJustFlushed] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);

    const goOnline = () => {
      setOnline(true);
      navigator.serviceWorker?.controller?.postMessage("FLUSH_QUEUE");
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    const handleSWMessage = (e: MessageEvent) => {
      if (e.data?.type === "QUEUED_OFFLINE") {
        setPending((p) => p + 1);
      }
      if (e.data?.type === "QUEUE_FLUSHED") {
        const count = e.data.flushed as number;
        setPending(0);
        setJustFlushed(count);
        setTimeout(() => setJustFlushed(0), 3000);
      }
      if (e.data?.type === "QUEUE_COUNT") {
        setPending(e.data.count as number);
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleSWMessage);
    navigator.serviceWorker?.controller?.postMessage("GET_QUEUE_COUNT");

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      navigator.serviceWorker?.removeEventListener("message", handleSWMessage);
    };
  }, []);

  if (justFlushed > 0) {
    return (
      <div className="bg-green-600 text-white text-xs text-center py-1.5 px-3">
        ✓ {justFlushed} queued report{justFlushed === 1 ? "" : "s"} submitted
        successfully
      </div>
    );
  }

  if (!online) {
    return (
      <div className="bg-amber-500 text-white text-xs text-center py-1.5 px-3 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
        You&apos;re offline
        {pending > 0 && (
          <span>
            &middot; {pending} report{pending === 1 ? "" : "s"} queued
          </span>
        )}
      </div>
    );
  }

  if (pending > 0) {
    return (
      <div className="bg-amanzi-500 text-white text-xs text-center py-1.5 px-3">
        Syncing {pending} queued report{pending === 1 ? "" : "s"}…
      </div>
    );
  }

  return null;
}
