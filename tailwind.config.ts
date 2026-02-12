import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        burgundy: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f8d5db',
          300: '#f2b3bd',
          400: '#e98799',
          500: '#db5c77',
          600: '#c53d5c',
          700: '#a6294b',
          800: '#8a2442',
          900: '#76223d',
          950: '#420e1e',
        },
        cream: {
          50: '#fdfaf7',
          100: '#faf3e8',
          200: '#f5ead6',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.06)',
        'card': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
        'card-hover': '0 8px 20px 0 rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
