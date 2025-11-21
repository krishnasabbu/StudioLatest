/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'wf-red': {
          DEFAULT: '#D71E28',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A6',
          400: '#F87171',
          500: '#D71E28',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#651C1C',
        },
        'wf-gold': {
          DEFAULT: '#FFCD41',
          50: '#FFFEF0',
          100: '#FFF9D6',
          200: '#FFF4AD',
          300: '#FFEB84',
          400: '#FFE05B',
          500: '#FFCD41',
          600: '#D9A92E',
          700: '#B3861F',
          800: '#8C6312',
          900: '#664308',
        },
      },
    },
  },
  plugins: [],
};
