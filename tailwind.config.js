/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        solutium: {
          dark: '#2c2f3a',   // Gris oscuro
          blue: '#502fb6',   // Azul (Primary Actions, Headers)
          grey: '#f2f4f8',   // Gris claro
          yellow: '#a000f3', // Violeta (Accents, CTA Backgrounds)
          green: '#005e79',  // Verde
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
