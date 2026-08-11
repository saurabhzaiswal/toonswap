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
        ink: '#171321',
        paper: '#fffdf9',
        canvas: '#fbf6ee',
        coral: '#ff624d',
        mint: '#55cdbd',
        violet: '#7152f3',
      },
      fontSize: {
        'ui-xs': ['0.8rem', { lineHeight: '1.4' }],
        'ui-sm': ['0.92rem', { lineHeight: '1.5' }],
        'ui': ['1rem', { lineHeight: '1.55' }],
        'ui-lg': ['1.18rem', { lineHeight: '1.5' }],
      },
      borderRadius: { toon: '22px', 'toon-lg': '34px' },
      boxShadow: { toon: '0 18px 50px rgba(39, 26, 14, 0.09)' },
    },
  },
  plugins: [],
};
