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
        boo: {
          DEFAULT: '#7A3DB8',
          soft: '#F0E6FA',
        },
        blobble: {
          DEFAULT: '#2FA7B8',
          soft: '#DCF3F6',
        },
        sprout: {
          DEFAULT: '#5FA344',
          soft: '#E7F3DE',
        },
        chef: {
          DEFAULT: '#E2793D',
          soft: '#FBE7DA',
        },
        noodle: {
          DEFAULT: '#D9A62E',
          soft: '#FBF0D9',
        },
        // blog category colors
        trend: {
          DEFAULT: '#2563EB',
          soft: '#DEE9FD',
        },
        biz: {
          DEFAULT: '#0D8A6B',
          soft: '#DBF3EC',
        },
        culture: {
          DEFAULT: '#C2417A',
          soft: '#F8E3EE',
        },
        insight: {
          DEFAULT: '#6C4CC4',
          soft: '#EAE3FA',
        },
        // 22nd game color
        acorn: {
          DEFAULT: '#B5651D',
          soft: '#F5E3CD',
        },
        // 23rd game color
        cloud: {
          DEFAULT: '#5B9BD1',
          soft: '#E4F0FA',
        },
        // 24th game color
        peek: {
          DEFAULT: '#E8677E',
          soft: '#FCE3E8',
        },
        // 25th game color
        duel: {
          DEFAULT: '#B8862E',
          soft: '#F7ECD8',
        },
        // 26th game color
        pigment: {
          DEFAULT: '#B8419C',
          soft: '#F5E3F0',
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
        'chomp': {
          '0%': { transform: 'scaleY(1)' },
          '40%': { transform: 'scaleY(0.55)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'punch-pop': 'punch-pop 0.25s ease-out',
        'merge-pulse': 'merge-pulse 0.2s ease-in-out',
        'chomp': 'chomp 0.18s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
