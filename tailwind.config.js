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
          DEFAULT: "hsl(var(--background))", // Light mode background
          dark: "#1a1b1e", // Dark mode background (dark gray)
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))", // Light mode text
          dark: "#e4e4e7", // Dark mode text (off-white)
        },
        primary: {
          DEFAULT: "#151342", // Deep Blue for light mode
          dark: "#202053", // Subdued Deep Blue for dark mode
          foreground: "#FFFFFF", // White for text in both modes
        },
        secondary: {
          DEFAULT: "#242262", // Dark Blue for light mode
          dark: "#2a2a6a", // Subdued Dark Blue for dark mode
          foreground: "#FFFFFF", // White for text in both modes
        },
        purple: {
          DEFAULT: "#5100B9", // Purple for light mode
          dark: "#6b42cc", // Softer purple for dark mode
          foreground: "#FFFFFF", // White for text in both modes
        },
        lightBlue: {
          DEFAULT: "#5252C6", // Light Blue for light mode
          dark: "#6363d2", // Softer Light Blue for dark mode
          foreground: "#FFFFFF", // White for text in both modes
        },
        navyBlue: {
          DEFAULT: "#223499", // Navy Blue for light mode
          dark: "#2d4b9a", // Softer Navy Blue for dark mode
          foreground: "#FFFFFF", // White for text in both modes
        },
        cyan: {
          DEFAULT: "#00D9EF", // Cyan for light mode
          dark: "#00b9cc", // Softer Cyan for dark mode
          foreground: "#000000", // Black for text in both modes
        },
        destructive: {
          DEFAULT: "#FF0000", // Bright Red for light mode
          dark: "#D32F2F", // Muted Red for dark mode
          foreground: "#FFFFFF", // White for text in both modes
        },
        muted: {
          DEFAULT: "#F1F5F9", // Light Muted for light mode
          dark: "#3c3c42", // Darker Muted for dark mode
          foreground: "#475569", // Muted text color
        },
        accent: {
          DEFAULT: "#ffffff", // Accent Cyan for light mode
          dark: "#00b9cc", // Muted Cyan for dark mode
          foreground: "#000000", // Black for text in both modes
        },
        popover: {
          DEFAULT: "#FFFFFF", // White for light mode
          dark: "#2a2a2e", // Dark gray for dark mode
          foreground: "#000000", // Black for text in both modes
        },
        card: {
          DEFAULT: "#F8FAFC", // Light card background for light mode
          dark: "#27272a", // Dark card background for dark mode
          foreground: "#1F2937", // Darker text for light mode
        },
        sidebar: {
          DEFAULT: "#151342", // Sidebar background deep blue
          dark: "#1a1a3b", // Darker sidebar for dark mode
          foreground: "#FFFFFF", // White text in both modes
          primary: "#242262", // Sidebar primary dark blue
          "primary-foreground": "#FFFFFF", // White text in both modes
          accent: "#5100B9", // Sidebar accent purple
          "accent-foreground": "#FFFFFF", // White text in both modes
          border: "#223499", // Navy blue border
          ring: "#00D9EF", // Cyan ring
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
