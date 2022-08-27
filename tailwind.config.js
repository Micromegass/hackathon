const defautTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    screens: {
      xs: '540px',
      ...defautTheme.screens,
    },
    extend: {},
  },
  plugins: [],
}
