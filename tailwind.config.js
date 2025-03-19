/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pacman: {
          yellow: '#FFCC00',
          blue: '#00BFFF',
          pink: '#FF69B4',
          red: '#FF0000',
          orange: '#FFA500',
        },
        maze: {
          blue: '#0000FF',
          black: '#000000',
        }
      },
    },
  },
  plugins: [],
} 