import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#f9f8f5",
          100: "#f0ede4",
          200: "#d9d2c2",
          300: "#bfb298",
          400: "#a08f71",
          500: "#877457",
          600: "#6f5f49",
          700: "#584b3c",
          800: "#3d342a",
          900: "#261f19"
        },
        accent: {
          500: "#0f766e",
          600: "#115e59",
          700: "#134e4a"
        },
        signal: {
          500: "#c2410c"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        panel: "0 18px 40px rgba(38, 31, 25, 0.08)"
      },
      backgroundImage: {
        "paper-grid":
          "linear-gradient(to right, rgba(135, 116, 87, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(135, 116, 87, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
} satisfies Config;
