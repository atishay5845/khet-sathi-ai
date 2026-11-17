/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#eef5ef', 100: '#dceade', 200: '#bbd6bf', 300: '#8db994', 400: '#619b6d', 500: '#3e7d50', 600: '#2f6640', 700: '#285236', 800: '#21432e', 900: '#1a3626', 950: '#10251a' },
        sand: '#f5f7f2',
        ink: '#17251c',
        muted: '#77847a',
        line: '#e7ece5',
        amber: '#d89a42',
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Manrope', 'sans-serif'] },
      boxShadow: {
        soft: '0 12px 35px rgba(23, 37, 28, 0.055)',
        card: '0 3px 14px rgba(23, 37, 28, 0.035)',
      },
      borderRadius: { '2xl': '1.15rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
}
