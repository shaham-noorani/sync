/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary palette
        mauve: {
          DEFAULT: '#9d858d',
          50: '#f5f0f2',
          100: '#e8dde1',
          200: '#d4c4ca',
          300: '#bba0b2',
          400: '#9d858d',
          500: '#9d858d',
          600: '#856e75',
          700: '#6b575d',
        },
        lilac: {
          DEFAULT: '#bba0b2',
          50: '#f7f3f6',
          100: '#ede5ea',
          200: '#dcccd6',
          300: '#bba0b2',
          400: '#a68b9e',
          500: '#917689',
        },
        lavender: {
          DEFAULT: '#a4a8d1',
          50: '#f3f3fa',
          100: '#e4e5f2',
          200: '#cccee5',
          300: '#a4a8d1',
          400: '#8b90c2',
          500: '#7278b3',
        },
        dark: {
          50: '#f8fafc',
          100: '#e2e8f0',
          200: '#94a3b8',
          300: '#64748b',
          400: '#475569',
          500: '#334155',
          600: '#1e293b',
          700: '#1a2235',
          800: '#141b2b',
          900: '#0f1420',
          950: '#0a0e17',
        },
      },
    },
  },
  plugins: [],
};
