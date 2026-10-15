/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cozy: {
          bg: '#1A1614',        // Nâu cà phê đậm chủ đạo
          surface: '#221C18',   // Bề mặt phụ
          card: '#2A221D',      // Nền card kính mờ
          cardHover: '#332A24', // Hover nhẹ
          border: 'rgba(217, 119, 6, 0.18)', // Border cam hổ phách mảnh
          text: '#F5EBE1',      // Màu chữ kem sáng ấm
          muted: '#A8998C',     // Chữ phụ xám nâu ấm
          dark: '#120F0D'
        },
        amber: {
          primary: '#D97706',   // Cam hổ phách
          warm: '#F59E0B',      // Vàng ấm mật ong
          light: '#FDE68A',
          terracotta: '#EA580C',// Cam đất
          glow: 'rgba(217, 119, 6, 0.35)'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      keyframes: {
        'nudge-shake': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '15%': { transform: 'translateX(-4px) rotate(-4deg)' },
          '30%': { transform: 'translateX(4px) rotate(4deg)' },
          '45%': { transform: 'translateX(-3px) rotate(-2deg)' },
          '60%': { transform: 'translateX(3px) rotate(2deg)' },
          '75%': { transform: 'translateX(-1px) rotate(0deg)' }
        },
        'heart-bounce': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.35)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' }
        },
        'pulse-warm': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(217, 119, 6, 0.25)' },
          '50%': { boxShadow: '0 0 25px rgba(245, 158, 11, 0.45)' }
        }
      },
      animation: {
        'nudge': 'nudge-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'heart': 'heart-bounce 0.35s ease-out forwards',
        'glow': 'pulse-warm 2.5s infinite ease-in-out'
      }
    },
  },
  plugins: [],
}
