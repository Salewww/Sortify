import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        'out-expo':   'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-exp': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'spring':     'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
          to:   { opacity: '1', transform: 'translateY(0)    scale(1)'    },
        },
        'toast-out': {
          from: { opacity: '1', transform: 'translateY(0)    scale(1)'    },
          to:   { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)'     },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to:   { opacity: '1', transform: 'translateX(0)'    },
        },
      },
      animation: {
        'toast-in':       'toast-in 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'toast-out':      'toast-out 150ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-in':        'fade-in 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-up':       'slide-up 250ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-in-right': 'slide-in-right 250ms cubic-bezier(0.23, 1, 0.32, 1)',
      },
      boxShadow: {
        'ring-primary': '0 0 0 3px rgba(99, 102, 241, 0.25)',
        'ring-gray':    '0 0 0 3px rgba(107, 114, 128, 0.15)',
        'card':         '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover':   '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
