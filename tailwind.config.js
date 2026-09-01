/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tnred: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#e70013',
          600: '#c50010',
          700: '#a3000d',
          800: '#83000a',
          900: '#5c0007',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sidebar: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-cairo)', 'Tahoma', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'sheet': '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 10px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
