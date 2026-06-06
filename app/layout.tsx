import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

export const metadata: Metadata = {
  title: "Amanz' Alert — Live water outage map for South Africa",
  description:
    "Report and track water outages across South Africa. Crowd-sourced, free, and built for everyone affected by water cuts.",
  manifest: "/manifest.webmanifest",
  applicationName: "Amanz' Alert",
  appleWebApp: {
    capable: true,
    title: "Amanz' Alert",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Amanz' Alert — Live water outage map for South Africa",
    description:
      "Crowd-sourced. Free. Built for everyone affected by water cuts in South Africa.",
    url: "https://amanz-alert.vercel.app",
    siteName: "Amanz' Alert",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amanz' Alert",
    description: "Live water outage map for South Africa.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1F7396",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <LangProvider>
          <Header />
          <OfflineBanner />
          <main className="flex-1 flex flex-col">{children}</main>
          <InstallPrompt />
        </LangProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
