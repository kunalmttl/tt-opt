import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#121215",
        "surface-raised": "#18181b",
        border: "#27272a",
        muted: "#71717a",
        primary: {
          DEFAULT: "#4f46e5",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          soft: "rgba(16, 185, 129, 0.12)",
        },
        danger: {
          DEFAULT: "#f43f5e",
          soft: "rgba(244, 63, 94, 0.12)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          soft: "rgba(245, 158, 11, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
