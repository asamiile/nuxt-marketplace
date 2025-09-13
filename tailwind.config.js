/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    container: {
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        primary: '#333',
        'primary-foreground': '#FFF',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        border: 'hsl(var(--border))',
        secondary: 'hsl(var(--secondary))',
        pink: {
          500: '#ec4899',
          600: '#db2777',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
        cyan: {
          500: '#06b6d4',
          600: '#0891b2',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
