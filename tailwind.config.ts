import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e2ebff",
          500: "#3d5afe",
          600: "#2f46e0",
          700: "#2536b3",
        },
      },
    },
  },
  plugins: [],
};

export default config;
