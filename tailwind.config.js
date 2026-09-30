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
        sans: ['"Segoe UI Variable"', '"Segoe UI"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', '"Segoe UI"', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        'sheet': '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 10px rgba(0,0,0,0.05)',
        'fluent': '0 4px 16px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'fluent-hover': '0 14px 34px -4px rgba(0, 0, 0, 0.09), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'fluent-card': '0 2px 10px 0 rgba(0, 0, 0, 0.03), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        'fluent-glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      }
    },
  },
  plugins: [],
}
