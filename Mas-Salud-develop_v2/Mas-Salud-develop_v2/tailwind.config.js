/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        dark: {
          primary: '#60a5fa',
          secondary: '#34d399',
          bg: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          'text-secondary': '#9ca3af',
          border: '#374151',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        'dark-success': '#34d399',
        'dark-warning': '#fbbf24',
        'dark-error': '#f87171',
      },
    },
  },
  plugins: [],
}