/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Open Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      transitionDuration: {
        1500: '1500ms',
        3000: '3000ms',
      },
    },
  },
  plugins: [],
}
