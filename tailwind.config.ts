import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1020",
        foreground: "#F8FAFC",
        surface: {
          DEFAULT: "#11182E",
          card: "#151D38",
          hover: "#1B2547",
          border: "#232F55",
          glass: "rgba(17, 24, 46, 0.75)",
        },
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          light: "#60A5FA",
          glow: "rgba(59, 130, 246, 0.25)",
        },
        accent: {
          DEFAULT: "#2DD4BF",
          hover: "#14B8A6",
          light: "#5EEAD4",
          glow: "rgba(45, 212, 191, 0.2)",
        },
        alarm: {
          safe: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "neon-blue": "0 0 25px -5px rgba(59, 130, 246, 0.3)",
        "neon-cyan": "0 0 25px -5px rgba(45, 212, 191, 0.3)",
        "neon-amber": "0 0 25px -5px rgba(245, 158, 11, 0.3)",
        "neon-red": "0 0 25px -5px rgba(239, 68, 68, 0.3)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
