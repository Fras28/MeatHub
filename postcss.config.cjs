module.exports = {
  plugins: {
    'tailwindcss/nesting': {}, // <--- DEBE IR AQUÍ, ANTES DE TAILWIND
    tailwindcss: {},
    autoprefixer: {},
  },
}