import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#EF9F27",
          primaryHover: "#BA7517",
          primaryDark: "#854F0B",
          accent: "#FAC775",
        },
        ui: {
          background: "#F1EFE8",
          surface: "#FFFFFF",
          border: "#E5E5E5",
        },
        text: {
          primary: "#2C2C2A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
