/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        charcoal: '#1f1f2b',
        pixelSlate: '#2c2c3a',
        highlight: '#f5c249',
      },
      boxShadow: {
        pixel: '0 4px 0 0 rgba(0,0,0,0.35)',
      },
      borderRadius: {
        pixel: '1.5rem',
      },
    },
  },
  plugins: [],
}
