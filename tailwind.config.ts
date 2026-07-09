import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F7F4',
        graphite: '#1B1D22',
        ink: '#33363D',
        index: '#C7CCD1',
        'index-dark': '#3A3E46',
        panel: '#FFFFFF',
        'panel-dark': '#23262C',
        // per-game signature colors
        echo: {
          DEFAULT: '#7C5CFF',
          soft: '#EFEAFF',
        },
        mirror: {
          DEFAULT: '#0FA89B',
          soft: '#E2F7F4',
        },
        debt: {
          DEFAULT: '#E14B4B',
          soft: '#FCE8E6',
        },
        gravity: {
          DEFAULT: '#8FAE1B',
          soft: '#EEF5D6',
        },
        fold: {
          DEFAULT: '#C9763B',
          soft: '#F7E9DE',
        },
        carry: {
          DEFAULT: '#3A56B0',
          soft: '#E2E7F7',
        },
        brace: {
          DEFAULT: '#5C7A8A',
          soft: '#E5ECEF',
        },
        splice: {
          DEFAULT: '#C23B8E',
          soft: '#F7E2EF',
        },
        heat: {
          DEFAULT: '#E05C1A',
          soft: '#FCEADE',
        },
        oneline: {
          DEFAULT: '#1A7FE0',
          soft: '#DEEEFA',
        },
        overflow: {
          DEFAULT: '#17A0A0',
          soft: '#D9F4F4',
        },
        polarity: {
          DEFAULT: '#7A3DB8',
          soft: '#EDE0F7',
        },
        shadow: {
          DEFAULT: '#4A4A6A',
          soft: '#EAEAF2',
        },
        tether: {
          DEFAULT: '#1A8C5B',
          soft: '#D9F2E8',
        },
        drift: {
          DEFAULT: '#1E7BC4',
          soft: '#D9EEFA',
        },
        phase: {
          DEFAULT: '#C4611E',
          soft: '#FAE8D9',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        tag: '2px',
      },
      boxShadow: {
        tag: '3px 3px 0 0 rgba(27, 29, 34, 0.9)',
        'tag-dark': '3px 3px 0 0 rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        'punch-pop': {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'merge-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'punch-pop': 'punch-pop 0.25s ease-out',
        'merge-pulse': 'merge-pulse 0.2s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
