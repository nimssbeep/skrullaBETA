/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        skrulla: {
          gold: '#ECC72E',
          'gold-dark': '#D49B1A',
          amber: '#E5B513',
          dark: '#070709',
          surface: '#141418',
          card: '#1C1C22'
        }
      }
    },
  },
  plugins: [],
}
