
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        alphex: {
          accent: "#FF7900",
          accentHover: "#E86E00",
          background: "#0C0C0C",
          surface: "#141414",
          elevated: "#1B1B1B",
          border: "#2B2B2B",
          muted: "#929292",
          text: "#F5F5F5",
          light: "#FFFFFF",
          lightSurface: "#F7F7F5",
          lightBorder: "#E9E8E5",
          lightText: "#171717"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
        heading: [
          "var(--font-space-grotesk)",
          "Arial",
          "sans-serif"
        ]
      },
      borderRadius: {
        panel: "12px"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0, 0, 0, 0.06)",
        elevated: "0 20px 60px rgba(0, 0, 0, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
