/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        positive: '#50C878',
        action: '#FFA630',
        alert: '#FF6B6B',
        accent: '#9B5DE5',
        heading: '#2E3A59',
        body: '#4F4F4F',
        label: '#828282',
      },
      fontFamily: {
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        /* Legacy aliases: existing font-montserrat/font-opensans classes now use new typefaces */
        'montserrat': ['Plus Jakarta Sans', 'sans-serif'],
        'opensans': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'h2': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'button': ['16px', { lineHeight: '24px', fontWeight: '600' }],
      },
      spacing: {
        '18': '72px', // 24px * 3
        '22': '88px', // 24px * 3.67
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '6px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
