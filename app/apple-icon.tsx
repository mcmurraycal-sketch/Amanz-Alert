import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1F7396",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M128 36 C 100 92, 72 130, 72 164 C 72 195 97 220 128 220 C 159 220 184 195 184 164 C 184 130 156 92 128 36 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
    size
  );
}
