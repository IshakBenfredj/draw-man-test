/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // secondary: {
          //   DEFAULT: "#F4A261",
          //   50: "#FEF6F1",
          //   100: "#FDEDE3",
          //   200: "#FBDBC7",
          //   300: "#F9C9AB",
          //   400: "#F7B78F",
          //   500: "#F4A261",
          //   600: "#F08A33",
        //   700: "#E47109",
        //   800: "#B45907",
        //   900: "#864205",
        // },
        primary: {
          DEFAULT: "#2A9D8F",
          50: "#E6F4F2",
          100: "#CCE9E5",
          200: "#99D3CB",
          300: "#66BDB1",
          400: "#33A797",
          500: "#2A9D8F",
          600: "#217D72",
          700: "#195E55",
          800: "#103E38",
          900: "#081F1B",
        },
        secondary: {
          DEFAULT: "#2C6EAB",
          50: "#E8F1F8",
          100: "#D1E3F1",
          200: "#A3C7E3",
          300: "#75ABD5",
          400: "#478FC7",
          500: "#2C6EAB",
          600: "#235881",
          700: "#1A4157",
          800: "#112A2D",
          900: "#081314",
        },
        bg : {
          DEFAULT: '#1E2733',
          100 : '#2f3b4b'
        },
        textColor : {
          DEFAULT : '#1f2937',
          sec: '#666',
        }
      },
      fontFamily: {
        mregular: ["MarkaziTextR", "sans-serif"],
        mmedium: ["MarkaziTextM", "sans-serif"],
        mbold: ["MarkaziTextB", "sans-serif"],
        msemibold: ["MarkaziTextS", "sans-serif"],
      },
    },
  },
  plugins: [],
};
