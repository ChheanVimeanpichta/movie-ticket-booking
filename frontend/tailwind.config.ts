import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'cine-red': '#E4162A',
        'cine-pink': '#F2A9A0',
        'cine-bg': '#0A0A0A',
        'cine-card': '#111111',
        'cine-card-hover': '#1A1A1A',
        'cine-border': '#1F1F1F',
        'cine-text': '#9CA3AF',
        'cine-text-light': '#D1D5DB',
        'cine-white': '#F9FAFB',
        'cine-gold': '#f4c430',
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
