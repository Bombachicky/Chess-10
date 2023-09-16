/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html"],
  theme: {

    extend: {
      colors: {
        primary: "#8c2c5c",
      },
    },
  },
  plugins: [],
}

