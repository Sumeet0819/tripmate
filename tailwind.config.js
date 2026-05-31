/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF6B35",
          darkBg: "#0A0F1E",
          cardBg: "#0D1B3E",
          textMuted: "#8A9BB5",
        }
      }
    },
  },
  plugins: [],
}
