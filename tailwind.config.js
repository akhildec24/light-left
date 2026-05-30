/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        mist: 'rgb(var(--color-mist) / <alpha-value>)',
        charcoal: 'rgb(var(--color-charcoal) / <alpha-value>)',
        matte: 'rgb(var(--color-matte) / <alpha-value>)',
        signal: 'rgb(var(--color-signal) / <alpha-value>)',
        amber: 'rgb(var(--color-amber) / <alpha-value>)',
        olive: 'rgb(var(--color-olive) / <alpha-value>)',
        steel: 'rgb(var(--color-steel) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Inter', 'SF Mono', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'wide-lg': '0.15em',
        'wide-xl': '0.25em',
      },
    },
  },
  plugins: [],
}
