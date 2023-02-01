/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff0083',
        success: '#028f83',
        info: '#01759f',
        warning: '#ff6b00',
        error: '#e60909'
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
