/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  content: [],
  theme: {
    extend: {
      colors: {
        'green-button': "#dafade",
        'button-text': "#56e47c"
      }
    },
  },
  plugins: [],
}

