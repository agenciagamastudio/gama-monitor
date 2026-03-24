import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gama-primary': '#88CE11',
        'gama-dark': '#161616',
        'gama-darker': '#0a0a0a',
        'gama-surface': '#272727',
        'gama-surface-accent': '#353535',
        'gama-text': '#FFFFFF',
        'gama-text-secondary': '#A1A1AA',
        'gama-text-tertiary': '#71717A',
        'gama-success': '#10B981',
        'gama-warning': '#F59E0B',
        'gama-error': '#E11D48',
        'gama-info': '#3B82F6',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
