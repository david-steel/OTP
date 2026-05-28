/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/views/**/*.ejs'],
  theme: {
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    extend: {
      colors: {
        otp: { 50: '#f0f7ff', 100: '#e0effe', 200: '#b9dffe', 300: '#7cc4fe', 400: '#4db8ff', 500: '#0095ff', 600: '#0076cc', 700: '#005899', 800: '#003d66', 900: '#0a0f1e', 950: '#060a14' },
        confidence: { high: '#059669', medium: '#d97706', low: '#9ca3af' },
        evidence: { measured: '#7c3aed', observed: '#2563eb', rule: '#059669', inference: '#d97706', speculation: '#9ca3af' },
        // Orgy brand palette -- promoted from partials/orgy-palette.ejs into config so
        // bg-orgy*/text-orgy*/border-orgy*/ring-orgy* compile into styles.css natively and
        // never depend on a per-page partial include (fixes the silent-purge no-op bug).
        // Values mirror the legacy partial exactly; the non-tokenizable bits (warm body bg,
        // mascot-wave animation, custom focus-ring shadows) live in src/styles/input.css.
        orgy: {
          DEFAULT: '#A8E63A',
          soft: '#D6F59C',
          deep: '#8BC42A',
          tint: 'rgba(168, 230, 58, 0.08)',
          bg: '#F5F7FA',
          'on-light': '#5a7d1f',
          blue: '#2563EB',
          'blue-soft': '#E6F0FF',
          'blue-deep': '#1d4ed8',
        },
        // Status roles for pills / scorecard heatmap (on-track green, off-track red, watch amber).
        status: {
          ontrack: '#16a34a',
          'ontrack-soft': '#dcfce7',
          offtrack: '#dc2626',
          'offtrack-soft': '#fee2e2',
          watch: '#d97706',
          'watch-soft': '#fef3c7',
        }
      }
    }
  },
  plugins: [],
}
