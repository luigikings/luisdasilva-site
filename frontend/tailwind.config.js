/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"VT323"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Neon arcade palette
        night: '#0b0620',
        abyss: '#070314',
        panel: '#170d36',
        panelHi: '#24164f',
        line: '#3a2a78',
        ink: '#f4f1ff',
        muted: '#a99fd6',
        neonPink: '#ff3ea5',
        neonCyan: '#22e4ff',
        neonLime: '#7cff6b',
        neonPurple: '#9b5cff',
        neonOrange: '#ff8a3d',
        coin: '#ffd23f',
        coinDark: '#c98a00',
        danger: '#ff4d5e',
      },
      boxShadow: {
        pixel: '0 6px 0 0 rgba(0,0,0,0.55)',
        'pixel-sm': '0 3px 0 0 rgba(0,0,0,0.55)',
        neon: '0 0 18px rgba(34,228,255,0.55), 0 0 42px rgba(155,92,255,0.35)',
        'neon-pink': '0 0 18px rgba(255,62,165,0.6), 0 0 48px rgba(255,62,165,0.25)',
        'neon-coin': '0 0 16px rgba(255,210,63,0.7), 0 0 40px rgba(255,138,61,0.35)',
      },
      borderRadius: {
        pixel: '1.25rem',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        hue: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        coinSpin: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 64px' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        floaty: 'floaty 3.2s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        hue: 'hue 8s linear infinite',
        coinSpin: 'coinSpin 1.6s linear infinite',
        scan: 'scan 7s linear infinite',
        gridMove: 'gridMove 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
