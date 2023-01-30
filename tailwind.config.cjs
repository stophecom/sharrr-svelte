/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff0083'
      },
      screens: {
        dz: { raw: '(hover: hover) and (pointer: fine)' } // For dropzone vs button
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '80ch' // Overwrites prose max-width
          }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
