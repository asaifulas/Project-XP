/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        xp: [
          'Tahoma',
          '"MS Sans Serif"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        xp: {
          /** Main text on chrome */
          panel: '#e8eaef',
          desktop: '#0a0a0c',
          'desktop-glow': '#151922',
          'desktop-edge': '#050506',
          'taskbar-top': '#2c3038',
          'taskbar-mid': '#1a1d24',
          'taskbar-bottom': '#0f1115',
          'taskbar-border': '#3d4450',
          'start-mid': '#2a303a',
          'start-outer': '#1f232b',
          'start-inner': '#14171d',
          tray: 'rgba(0,0,0,0.22)',
          'tray-line': 'rgba(255,255,255,0.08)',
          'menu-shell': '#1b1e26',
          'menu-left': '#2a2d36',
          'menu-right-t': '#24406e',
          'menu-right-b': '#1a3058',
          'menu-footer': '#2a2d36',
          'menu-line': '#0a0b0f',
          'header-t': '#2f4a7a',
          'header-b': '#1e2f52',
          'avatar-t': '#4a6fb5',
          'avatar-b': '#2a4170',
          'prog-t': '#2e333d',
          'prog-m': '#252a32',
          'prog-b': '#1a1d24',
          'prog-a-t': '#4a5a72',
          'prog-a-m': '#3a4558',
          'prog-a-b': '#2a3342',
          'tile-t': '#6b8cce',
          'tile-b': '#3d5a99',
          'micon-t': '#7a8aa8',
          'micon-b': '#4a5568',
          'foot-t': '#3a3f4a',
          'foot-b': '#252830',

          window: {
            // Classic XP (Luna) window chrome
            'title-t': '#3d8bfd',
            'title-m': '#1f6fe5',
            'title-b': '#0b4bb0',
            'title-text': '#ffffff',
            frame: '#2457c5',
            'frame-hi': '#b9d4ff',
            'frame-lo': '#0c2f78',
            menu: '#ece9d8',
            'menu-text': '#0b0b0b',
            body: '#f6f6f6',
            'body-text': '#111827',
          },
        },
      },
      boxShadow: {
        /** Taskbar top highlight */
        'xp-bar': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'xp-start':
          'inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 0 rgba(0,0,0,0.45)',
        'xp-start-pressed':
          'inset 0 2px 6px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(255,255,255,0.04)',
        'xp-prog':
          'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 0 rgba(0,0,0,0.35)',
        'xp-prog-active':
          'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.35)',
        'xp-menu':
          '0 -4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        'xp-foot': 'inset 0 1px 0 rgba(255,255,255,0.08)',
        'xp-tile': 'inset 0 1px 0 rgba(255,255,255,0.2)',
        'xp-avatar': 'inset 0 1px 0 rgba(255,255,255,0.15)',
        'xp-window-frame':
          'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.35)',
        'xp-window-title':
          'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
