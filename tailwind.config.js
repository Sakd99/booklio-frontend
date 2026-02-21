/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--color-base)',
        surface: 'var(--color-surface)',
        'surface-hover': 'var(--color-surface-hover)',
        card: 'var(--color-card)',
        'card-hover': 'var(--color-card-hover)',
        foreground: 'var(--color-foreground)',
        'fg-secondary': 'var(--color-fg-secondary)',
        muted: 'var(--color-muted)',
        dim: 'var(--color-dim)',
        'b-border': 'var(--color-border)',
        'input-bg': 'var(--color-input-bg)',
        sidebar: 'var(--color-sidebar)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
