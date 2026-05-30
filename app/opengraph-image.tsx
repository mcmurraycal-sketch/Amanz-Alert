import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Amanz' Alert — live water outage map for South Africa";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1F7396 0%, #0B1F3A 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="84" height="84" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M128 36 C 100 92, 72 130, 72 164 C 72 195 97 220 128 220 C 159 220 184 195 184 164 C 184 130 156 92 128 36 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: -1.5 }}>
            Amanz&apos; Alert
          </div>
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 60,
            maxWidth: 980,
          }}
        >
          Live water outage map for South Africa.
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.85,
            marginTop: 32,
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          Crowd-sourced. Free. Built for everyone affected by water cuts.
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            opacity: 0.7,
          }}
        >
          <span>amanz-alert.vercel.app</span>
          <span>Pilot: Eastern Cape</span>
        </div>
      </div>
    ),
    size
  );
}
