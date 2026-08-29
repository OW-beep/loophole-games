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
        // 27th game color
        waypoint: {
          DEFAULT: '#3B7A57',
          soft: '#DCEEE3',
        },
        // 28th game color
        cairn: {
          DEFAULT: '#8B6F4E',
          soft: '#EFE7DA',
        },
        // 29th game color
        decant: {
          DEFAULT: '#2D7DA8',
          soft: '#DCEBF3',
        },
        // 30th game color
        cipher: {
          DEFAULT: '#5B4B8A',
          soft: '#E6E1F2',
        },
        // 31st game color
        clearway: {
          DEFAULT: '#C6432E',
          soft: '#F7DFDA',
        },
        // 32nd game color
        overdraw: {
          DEFAULT: '#C4831F',
          soft: '#F7E9D2',
        },
        // 33rd game color
        burrow: {
          DEFAULT: '#A8763F',
          soft: '#F0E4D3',
        },
        // 34th game color
        vantage: {
          DEFAULT: '#4A5FC1',
          soft: '#E3E6F7',
        },
        // 35th game color
        tumble: {
          DEFAULT: '#B8622E',
          soft: '#F5E3D3',
        },
        // 36th game color
        untangle: {
          DEFAULT: '#2E9A8C',
          soft: '#D9F0EC',
        },
        // 37th game color
        flicker: {
          DEFAULT: '#D4A017',
          soft: '#FBF1D3',
        },
        // 38th game color
        lastlight: {
          DEFAULT: '#455A7A',
          soft: '#DEE5EE',
        },
        // 39th game color
        blueprint: {
          DEFAULT: '#6B8E4E',
          soft: '#E5EDDC',
        },
        // 40th game color
        bloom: {
          DEFAULT: '#3D8B7A',
          soft: '#DCEEE9',
        },
        // 41st game color
        apex: {
          DEFAULT: '#E86A2E',
          soft: '#FBE5D6',
        },
        pulse: {
          DEFAULT: '#D1264F',
          soft: '#FBE0E6',
        },
        blip: {
          DEFAULT: '#2E9E6B',
          soft: '#DFF4EA',
        },
        coin: {
          DEFAULT: '#C98A1D',
          soft: '#FBEDD2',
        },
        croak: {
          DEFAULT: '#4E9B4E',
          soft: '#DFEEDA',
        },
        bounce: {
          DEFAULT: '#E0559B',
          soft: '#FCE3F0',
        },
        wiggle: {
          DEFAULT: '#7DB33A',
          soft: '#E7F3D9',
        },
        stax: {
          DEFAULT: '#FF6B4A',
          soft: '#FFE3DB',
        },
        clash: {
          DEFAULT: '#5A6ACF',
          soft: '#E2E5FA',
        },
        carom: {
          DEFAULT: '#2FB6A8',
          soft: '#DBF3EF',
        },
        // 51st game color
        regent: {
          DEFAULT: '#6B3FA0',
          soft: '#EAE0F5',
        },
        // 52nd game color
        skein: {
          DEFAULT: '#3F7A72',
          soft: '#DFEEEB',
        },
        // 52nd game color
        vials: {
          DEFAULT: '#3FA0A0',
          soft: '#DFF3F3',
        },
        // Global "bolt" accents — not tied to any one game, used for
        // shared chrome (header, hero, buttons) to give the whole site
        // a more energetic, arcade-marquee pop across every page.
        bolt: {
          pink: '#FF2E63',
          yellow: '#FFD400',
          cyan: '#00E5FF',
          purple: '#7B2FF7',
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
        pop: '5px 5px 0 0 #FF2E63',
        'pop-cyan': '5px 5px 0 0 #00E5FF',
      },
      keyframes: {
        'punch-pop': {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'marquee-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
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
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'punch-pop': 'punch-pop 0.25s ease-out',
        'merge-pulse': 'merge-pulse 0.2s ease-in-out',
        'chomp': 'chomp 0.18s ease-in-out',
        'shake': 'shake 0.3s ease-in-out',
        'marquee-glow': 'marquee-glow 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
