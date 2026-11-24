/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          card: '#111726',
          border: '#1f293d',
          accent: '#00ff88',
          cyan: '#00f0ff',
          red: '#ff3b69',
          purple: '#9d4edd',
          yellow: '#ffb703',
          text: '#e2e8f0',
          muted: '#8b9bb4',
          surface: '#161f33'
        }
      },
      fontFamily: {
        mono: ['Consolas', 'JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
