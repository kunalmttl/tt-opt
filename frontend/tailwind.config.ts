import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#08090a",
        surface: "#0f1115",
        "surface-raised": "#16191f",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        border: "#1f242c",
        muted: "#848d9a",
        lime: {
          DEFAULT: "#d4f938",
          hover: "#e2fe55",
          muted: "rgba(212, 249, 56, 0.12)",
          border: "rgba(212, 249, 56, 0.25)",
        },
        primary: {
          DEFAULT: "#d4f938",
          foreground: "#08090a",
        },
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "ui-monospace",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
