import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: "#f0f0f5",
          100: "#d6d6e3",
          200: "#adadc7",
          300: "#8484ab",
          400: "#5b5b8f",
          500: "#3a3a6b",
          600: "#2d2d56",
          700: "#202041",
          800: "#14142e",
          900: "#0a0a1a",
          950: "#04040a",
        },
        gold: {
          50: "#fef9e7",
          100: "#fdf0c4",
          200: "#fbe49d",
          300: "#f5e6a3",
          400: "#e8c54a",
          500: "#d4af37",
          600: "#c9a84c",
          700: "#b8962e",
          800: "#a07d20",
          900: "#8a6514",
          950: "#5a4208",
        },
        luxury: {
          champagne: "#F5E6A3",
          rose: "#E8B4A8",
          platinum: "#E5E4E2",
          bronze: "#CD7F32",
          ivory: "#FFFFF0",
          crimson: "#DC143C",
          navy: "#000080",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        gold: "0.5rem",
        "gold-lg": "1rem",
        "gold-xl": "1.5rem",
      },
      boxShadow: {
        gold: "0 4px 20px rgba(212, 175, 55, 0.3)",
        "gold-lg": "0 8px 40px rgba(212, 175, 55, 0.4)",
        "gold-sm": "0 2px 10px rgba(212, 175, 55, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.2)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        float: "float 3s ease-in-out infinite",
        glowPulse: "glowPulse 2s ease-in-out infinite",
        aurora: "aurora 15s ease infinite",
        spotlight: "spotlight 8s ease infinite",
        grain: "grain 0.5s steps(4) infinite",
        fadeIn: "fadeIn 0.6s ease-out",
        slideUp: "slideUp 0.6s ease-out",
        scaleIn: "scaleIn 0.4s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 175, 55, 0.6)" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.5)" },
          "50%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.5)" },
        },
        grain: {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-5%, 5%)" },
          "50%": { transform: "translate(5%, -5%)" },
          "75%": { transform: "translate(-2%, -2%)" },
          "100%": { transform: "translate(0, 0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37, #F5E6A3, #C9A84C)",
        "gold-gradient-vertical": "linear-gradient(180deg, #D4AF37, #C9A84C)",
        "dark-gradient": "linear-gradient(180deg, #04040a 0%, #0a0a1a 50%, #14142e 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
