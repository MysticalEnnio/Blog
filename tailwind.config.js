// tailwind.config.js
module.exports = {
  mode: "jit",
  // These paths are just examples, customize them to match your project structure
  content: ["./public/index.html", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        pastel: {
          1: "#01002E",
          2: "#2F72BA",
          3: "#3D9FDD",
          4: "#EFB2EF",
          5: "#D5BAC7",
          6: "#DD74CF",
          7: "#DD53B4",
        },
      },
      screens: {
        vertical: { raw: "(min-width: 768px) and (min-aspect-ratio: 1/1)" },
      },
    },
  },
};
