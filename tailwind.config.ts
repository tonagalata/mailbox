import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EC",
        navy: {
          DEFAULT: "#1A2238",
          light: "#2A3354",
          muted: "#3D4566",
        },
        ink: "#1A2238",
        slate: {
          DEFAULT: "#6B7280",
          light: "#9CA3AF",
        },
        stamp: {
          DEFAULT: "#C1440E",
          light: "#E3622F",
          tint: "#FBE9E1",
        },
        forest: {
          DEFAULT: "#2F8F6E",
          tint: "#E3F2EC",
        },
        line: "#E7E1D6",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,34,56,0.06), 0 1px 12px rgba(26,34,56,0.04)",
        stack: "0 8px 24px rgba(26,34,56,0.12)",
      },
      borderRadius: {
        card: "14px",
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
