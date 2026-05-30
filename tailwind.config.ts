import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B1F3A",
        amanzi: {
          50: "#EFF8FB",
          100: "#D5ECF4",
          300: "#7CC4DD",
          500: "#2E8FB6",
          600: "#1F7396",
          700: "#155875",
        },
        alert: {
          500: "#E0492B",
          600: "#B83820",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
