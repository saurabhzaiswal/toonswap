/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        toon: {
          bg: '#0f0b1e',
          card: '#1a1530',
          accent: '#ff5cad',
          accent2: '#7c5cff',
          gold: '#ffc857',
        },
      },
    },
  },
  plugins: [],
};
