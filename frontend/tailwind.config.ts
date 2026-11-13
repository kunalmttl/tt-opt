import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#e8eae4",
        surface: "#f5f6f1",
        "surface-raised": "#ffffff",
        border: "#d8dcd3",
        "border-subtle": "#e1e4dc",
        muted: "#6f7871",
        "text-primary": "#1c221e",
        "text-secondary": "#49534c",

        // Palette inspired by reference
        coral: {
          DEFAULT: "#ee6c65",
          hover: "#e55d56",
          light: "#fae7e6",
          dark: "#bd4a44",
        },
        canary: {
          DEFAULT: "#f2e366",
          hover: "#ebd94c",
          light: "#faf6db",
          dark: "#9c8e1e",
        },
        forest: {
          DEFAULT: "#3d4740",
          hover: "#323a34",
          light: "#606d64",
          dark: "#202622",
        },
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
        "4xl": "30px",
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
