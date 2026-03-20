/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/views/**/*.ejs'],
  theme: {
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    extend: {
      colors: {
        otp: { 50: '#f0f7ff', 100: '#e0effe', 200: '#b9dffe', 300: '#7cc4fe', 400: '#4db8ff', 500: '#0095ff', 600: '#0076cc', 700: '#005899', 800: '#003d66', 900: '#0a0f1e', 950: '#060a14' },
        confidence: { high: '#059669', medium: '#d97706', low: '#9ca3af' },
        evidence: { measured: '#7c3aed', observed: '#2563eb', rule: '#059669', inference: '#d97706', speculation: '#9ca3af' }
      }
    }
  },
  plugins: [],
}
