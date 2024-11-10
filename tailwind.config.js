/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  darkMode: 'class', // Habilitar el modo oscuro con la clase 'dark'
  theme: {
    extend: {
      colors: {
        darkBg: '#000000', // Fondo para modo oscuro
        darkText: '#ffffff', // Texto para modo oscuro
        lightBg: '#000000', // Fondo para modo claro
        lightText: '#060709', // Texto para modo claro
        blueDark: '#1E40AF', // Azul oscuro para botones en modo oscuro
        blueLight: '#1D4ED8', // Azul para botones en modo claro
        orange: {
          400: '#F97316', // Naranja claro
          500: '#F97300', // Naranja intermedio
          600: '#EA580C', // Naranja oscuro
        },
      },
    },
  },
  variants: {
    extend: {
      translate: ['dark'], // Habilita las clases de traducción en modo oscuro si no funcionan
    },
  },
  plugins: [],
}
