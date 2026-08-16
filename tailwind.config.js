/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/views/**/*.hbs'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
