/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6', // Purple
        'primary-light': '#A78BFA',
        'primary-dark': '#7C3AED',
        secondary: '#EC4899', // Pink accent
        positive: '#10B981',
        action: '#F59E0B',
        alert: '#EF4444',
        accent: '#9333EA', // Deep purple
        'accent-light': '#C084FC',
        heading: '#1F2937',
        body: '#6B7280',
        label: '#9CA3AF',
        'glass-50': 'rgba(139, 92, 246, 0.05)',
        'glass-100': 'rgba(139, 92, 246, 0.1)',
        'glass-200': 'rgba(139, 92, 246, 0.2)',
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
        'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px 0 rgba(139, 92, 246, 0.12)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'gradient-violet': 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
      },
    },
  },
  plugins: [],
}
