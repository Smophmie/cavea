/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: "#faf9f6",
        wine: "#bb2700",
        darkwine: "#8B1E00",
        gray: "#6B7280",
        lightgray: "#e2e8f0",
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_400Regular'],
        playfairbold: ['PlayfairDisplay_700Bold'],
      },
    },
  },
  plugins: [],
};
