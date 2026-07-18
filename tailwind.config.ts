import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#141414",
          raised: "#1C1C1C",
          line: "#2A2A2A",
        },
        paper: {
          DEFAULT: "#FAFAF8",
          dim: "#B8B6B0",
        },
        gold: {
          dim: "#8A7128",
          DEFAULT: "#D4AF37",
          bright: "#E8C766",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      keyframes: {
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "orbit-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.85)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "70%": { opacity: "1", transform: "scale(1.06)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        "ring-grow": {
          "0%": { opacity: "0.9", transform: "scale(0.8)" },
          "100%": { opacity: "0", transform: "scale(1.5)" },
        },
      },
      animation: {
        orbit: "orbit 14s linear infinite",
        "orbit-reverse": "orbit-reverse 20s linear infinite",
        "orbit-fast": "orbit 9s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "spin-slow": "spin-slow 1s linear infinite",
        pop: "pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
        "draw-check": "draw-check 0.5s 0.35s ease-out both",
        "ring-grow": "ring-grow 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
