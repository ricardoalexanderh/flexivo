/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'atomic-age': ['Atomic Age', 'sans-serif'],
      },
      colors: {
        'clean-black': '#0a0a0a',
        'clean-gray': '#1a1a1a',
        'clean-white': '#ffffff',
        'clean-light': '#f8fafc',
        'text-primary-dark': '#0f172a',
        'text-secondary-dark': '#64748b',
        'text-primary-light': '#ffffff',
        'text-secondary-light': '#a3a3a3',
      }
    },
  },
  plugins: [],
}