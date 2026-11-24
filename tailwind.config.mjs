/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chill: {
          bg: '#0b0f17',         // Deep cozy midnight
          card: '#111827',       // Soft slate card
          surface: '#172033',    // Raised surface
          border: '#1f293d',     // Subtle border
          indigo: '#818cf8',     // Soft chill indigo
          purple: '#a78bfa',     // Calm violet
          sky: '#38bdf8',        // Soothing cyan
          mint: '#34d399',       // Soft mint green
          rose: '#fb7185',       // Gentle rose
          amber: '#fbbf24',      // Soft amber
          text: '#f1f5f9',       // Clean primary text
          muted: '#94a3b8',      // Relaxed secondary text
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
