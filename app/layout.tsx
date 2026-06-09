import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
import FloatingActions from "@/components/FloatingActions";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://amanz-alert.vercel.app";

const SITE_DESCRIPTION =
  "Live, crowd-sourced map of water outages across South Africa. Report an outage in your area, see what's affecting your suburb in real time, and lodge an official complaint with one tap.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Amanz' Alert — Live water outage map for South Africa",
    template: "%s | Amanz' Alert",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "water outage",
    "water cut",
    "South Africa",
    "Eastern Cape",
    "Makhanda",
    "Johannesburg",
    "Cape Town",
    "Amanz' Alert",
    "load shedding water",
    "municipal water complaint",
    "water shortage map",
    "civic tech",
  ],
  authors: [{ name: "Amanz' Alert" }],
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Amanz' Alert — Live water outage map for South Africa",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Amanz' Alert",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amanz' Alert",
    description:
      "Live water outage map for South Africa. Crowd-sourced, free.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "k3qPFTIWQP6qfbyAjGJrp2d02aOus5cJ94sO4J39m5k",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1F7396",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Amanz' Alert",
      description: SITE_DESCRIPTION,
      inLanguage: "en-ZA",
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/feed?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Amanz' Alert",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      areaServed: { "@type": "Country", name: "South Africa" },
      description:
        "Independent, crowd-sourced public-interest service mapping water outages across South Africa.",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        <LangProvider>
          <Header />
          <OfflineBanner />
          <main className="flex-1 flex flex-col pb-20">{children}</main>
          <FloatingActions />
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
