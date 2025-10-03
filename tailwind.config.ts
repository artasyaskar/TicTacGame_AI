import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00E5FF',
          pink: '#FF2D95',
          green: '#39FF14',
          purple: '#9B5CFF',
        },
        base: '#0a0a0f',
        panel: '#11111a',
      },
      boxShadow: {
        neon: '0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(155,92,255,0.3)'
      },
    },
  },
  plugins: [],
}
export default config
