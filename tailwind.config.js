/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B781',
          hover: '#00908C',
          soft: '#E5FAF9',
        },
        lime: {
          accent: '#A3E635',
          soft: '#ECFCCB',
        },
        page: {
          bg: '#F5F7FB',
        },
        card: {
          bg: '#FFFFFF',
        },
        border: {
          subtle: '#E5E7EB',
        },
        text: {
          main: '#111827',
          muted: '#6B7280',
          ondark: '#FFFFFF',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#1E7BBF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '8px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
