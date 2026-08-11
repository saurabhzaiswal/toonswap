/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        toon: {
          bg: 'var(--color-ink)',
          card: 'var(--color-surface)',
          accent: 'var(--color-primary)',
          accent2: 'var(--color-tertiary)',
          gold: 'var(--color-accent)',
        },
        ink: 'var(--color-ink)',
        paper: 'var(--color-surface)',
        canvas: 'var(--color-canvas)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        accent: 'var(--color-accent)',
        coral: 'var(--color-primary)',
        mint: 'var(--color-secondary)',
        violet: 'var(--color-tertiary)',
      },
      fontSize: {
        'ui-xs': ['0.8rem', { lineHeight: '1.4' }],
        'ui-sm': ['0.92rem', { lineHeight: '1.5' }],
        ui: ['1rem', { lineHeight: '1.55' }],
        'ui-lg': ['1.18rem', { lineHeight: '1.5' }],
      },
      borderRadius: { toon: '22px', 'toon-lg': '34px' },
      boxShadow: { toon: 'var(--shadow-soft)' },
    },
  },
  plugins: [],
};
