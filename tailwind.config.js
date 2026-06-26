
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff4ed',
          100: '#ffebd5',
          200: '#ffd3aa',
          300: '#ffb476',
          400: '#ff8a3a',
          500: '#ff6b0a',
          600: '#f05100',
          700: '#c73b02',
          800: '#9e2f0a',
          900: '#7f290c',
          950: '#451204',
        },
        secondary: {
          500: '#10b981', // Fresh herb green
        }
      }
    },
  },
  plugins: [],
}
