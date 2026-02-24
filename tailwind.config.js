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
        violet: {
          DEFAULT: '#8875ff',
          50:  '#f3f1ff',
          100: '#e5e0ff',
          200: '#cdc5ff',
          300: '#b0a4ff',
          400: '#9b8fff',
          500: '#8875ff',
          600: '#7560f0',
          700: '#6250d8',
        },
        'accent-2': '#c084fc',
        dark: {
          50:  '#f0f0ff',
          100: '#d0d0e8',
          200: '#a0a0c0',
          300: '#8b8fa8',
          400: '#5a5f7a',
          500: '#3a3f58',
          600: '#252840',
          700: '#181b2e',
          800: '#111320',
          900: '#09090f',
          950: '#05050a',
        },
      },
    },
  },
  plugins: [],
};
