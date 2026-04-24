/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg:     '#0f1621',
          card:   '#1a2035',
          card2:  '#1e2640',
          border: 'rgba(255,255,255,0.07)',
        }
      }
    },
  },
  plugins: [],
}
