"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import {
  MAIL_PROVIDERS,
  type MailProvider,
  getPreferredProvider,
  setPreferredProvider,
  openMailComposer,
} from "@/lib/mailProviders";
import { buildComplaintMessage } from "@/lib/complaint";
import type { ComplaintRouting } from "@/lib/authorities";
import type { Severity, Cause } from "@/lib/types";

type ComplaintReport = {
  id: string;
  lat: number;
  lng: number;
  severity: Severity;
  cause: Cause | null;
  note: string | null;
  suburb: string | null;
  municipality: string | null;
  created_at: string;
};

type Props = {
  report: ComplaintReport;
  routing: ComplaintRouting;
  onSend?: () => void;
  className?: string;
  variant?: "primary" | "compact";
};

export default function ComplaintButton({
  report,
  routing,
  onSend,
  className,
  variant = "primary",
}: Props) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [preferred, setPreferred] = useState<MailProvider | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPreferred(getPreferredProvider());
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const message = buildComplaintMessage(report, routing);

  const send = (p: MailProvider) => {
    setPreferred(p);
    setPreferredProvider(p);
    setOpen(false);
    onSend?.();
    openMailComposer(p, message);
  };

  const preferredLabel = preferred
    ? MAIL_PROVIDERS.find((p) => p.id === preferred)?.label
    : null;

  if (variant === "compact") {
    return (
      <div ref={rootRef} className={`relative inline-block ${className ?? ""}`}>
        <button
          type="button"
          onClick={() => (preferred ? send(preferred) : setOpen((o) => !o))}
          aria-expanded={open}
          className="text-ink font-medium hover:underline text-xs"
        >
          📨 {t("complaint.send")}
        </button>
        {open && (
          <div
            role="menu"
            className="absolute z-30 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden w-56"
          >
            <p className="px-3 py-2 text-[11px] uppercase tracking-wide text-ink/50 bg-slate-50 border-b border-slate-100">
              {t("complaint.pick_mail")}
            </p>
            {MAIL_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="menuitem"
                onClick={() => send(p.id)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2 text-sm border-b border-slate-100 last:border-0"
              >
                <span aria-hidden>{p.icon}</span>
                <span className="text-ink flex-1">{p.label}</span>
                {preferred === p.id && (
                  <span className="text-amanzi-600 text-[10px] font-medium">
                    {t("complaint.current")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {preferred ? (
        <div className="flex">
          <button
            type="button"
            onClick={() => send(preferred)}
            className="flex-1 bg-ink hover:bg-ink/90 active:scale-95 transition text-white font-semibold rounded-l-lg py-3 px-4 flex items-center justify-center gap-2"
          >
            <span aria-hidden>📨</span>
            <span>{t("complaint.send")}</span>
            {preferredLabel && (
              <span className="text-white/60 text-xs hidden sm:inline">
                · {preferredLabel}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Choose mail provider"
            aria-expanded={open}
            className="bg-ink hover:bg-ink/90 active:scale-95 transition text-white font-semibold rounded-r-lg px-3 border-l border-white/10"
          >
            <span aria-hidden>▾</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full bg-ink hover:bg-ink/90 active:scale-95 transition text-white font-semibold rounded-lg py-3 px-4 flex items-center justify-center gap-2"
        >
          <span aria-hidden>📨</span> {t("complaint.send")}
        </button>
      )}

      {open && (
        <div
          role="menu"
          className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
        >
          <p className="px-4 py-2 text-[11px] uppercase tracking-wide text-ink/50 bg-slate-50 border-b border-slate-100">
            {t("complaint.pick_mail")}
          </p>
          {MAIL_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitem"
              onClick={() => send(p.id)}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 text-sm border-b border-slate-100 last:border-0"
            >
              <span aria-hidden className="text-lg">
                {p.icon}
              </span>
              <span className="text-ink flex-1">{p.label}</span>
              {preferred === p.id && (
                <span className="text-amanzi-600 text-[11px] font-medium">
                  {t("complaint.current")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
