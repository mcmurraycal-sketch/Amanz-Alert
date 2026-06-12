export type MailProvider = "default" | "gmail" | "outlook" | "yahoo";

export const MAIL_PROVIDERS: ReadonlyArray<{
  id: MailProvider;
  label: string;
  icon: string;
}> = [
  { id: "default", label: "Default mail app", icon: "📧" },
  { id: "gmail", label: "Gmail (web)", icon: "✉️" },
  { id: "outlook", label: "Outlook (web)", icon: "📩" },
  { id: "yahoo", label: "Yahoo Mail (web)", icon: "💌" },
];

export type MailMessage = {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
};

export function buildProviderUrl(
  provider: MailProvider,
  m: MailMessage
): string {
  const to = m.to.join(",");
  const cc = m.cc.join(",");
  const enc = encodeURIComponent;
  const ccParam = cc ? `&cc=${enc(cc)}` : "";

  switch (provider) {
    case "default":
      return `mailto:${enc(to)}?subject=${enc(m.subject)}${ccParam}&body=${enc(
        m.body
      )}`;
    case "gmail":
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(
        to
      )}&su=${enc(m.subject)}${ccParam}&body=${enc(m.body)}`;
    case "outlook":
      return `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(
        to
      )}&subject=${enc(m.subject)}${ccParam}&body=${enc(m.body)}`;
    case "yahoo":
      return `https://compose.mail.yahoo.com/?to=${enc(to)}&subject=${enc(
        m.subject
      )}${ccParam}&body=${enc(m.body)}`;
  }
}

const STORAGE_KEY = "amanzi_mail_provider";

export function getPreferredProvider(): MailProvider | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return MAIL_PROVIDERS.some((p) => p.id === v) ? (v as MailProvider) : null;
}

export function setPreferredProvider(p: MailProvider): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, p);
}

export function openMailComposer(
  provider: MailProvider,
  message: MailMessage
): void {
  const url = buildProviderUrl(provider, message);
  if (provider === "default") {
    window.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
