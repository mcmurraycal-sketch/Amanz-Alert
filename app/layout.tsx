import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import InstallPrompt from "@/components/InstallPrompt";
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
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
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
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <InstallPrompt />
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
