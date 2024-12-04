/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
        background: {
          DEFAULT: "hsl(var(--background))",
          dark: "#1a1b1e",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          dark: "#e4e4e7",
        },
        primary: {
          DEFAULT: "#151342",
          dark: "#202053",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#242262",
          dark: "#2a2a6a",
          foreground: "#FFFFFF",
        },
        purple: {
          DEFAULT: "#5100B9",
          dark: "#6b42cc",
          foreground: "#FFFFFF",
        },
        lightBlue: {
          DEFAULT: "#5252C6",
          dark: "#6363d2",
          foreground: "#FFFFFF",
        },
        navyBlue: {
          DEFAULT: "#223499",
          dark: "#2d4b9a",
          foreground: "#FFFFFF",
        },
        cyan: {
          DEFAULT: "#00D9EF",
          dark: "#00b9cc",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#FF0000",
          dark: "#D32F2F",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          dark: "#3c3c42",
          foreground: "#475569",
        },
        accent: {
          DEFAULT: "#ffffff",
          dark: "#00b9cc",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          dark: "#2a2a2e",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#F8FAFC",
          dark: "#27272a",
          foreground: "#1F2937",
        },
        sidebar: {
          DEFAULT: "#151342",
          dark: "#1a1a3b",
          foreground: "#FFFFFF",
          primary: "#242262",
          "primary-foreground": "#FFFFFF",
          accent: "#5100B9",
          "accent-foreground": "#FFFFFF",
          border: "#223499",
          ring: "#00D9EF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
