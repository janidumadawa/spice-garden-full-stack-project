// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'text-dark': '#2F2F2F',
        'primary-red': '#C41E3A',
        'primary-gold': '#D4AF37',
        'cream-bg': '#FFF8E7',
        'warm-yellow': '#F0BB3A',
        'success-green': '#228B22',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config