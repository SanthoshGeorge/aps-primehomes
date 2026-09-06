import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f6f4",
          100: "#e2e9e4",
          500: "#3f6b52",
          600: "#33573f",
          700: "#294632",
        },
      },
    },
  },
  plugins: [],
};
export default config;
