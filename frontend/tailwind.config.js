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
        warm: {
          bg: '#FAF8F5',        // Nền kem vani ấm dịu mắt
          surface: '#F5F0E8',   // Bề mặt phụ latte / biscuit
          card: '#FFFFFF',      // Nền card trắng ấm
          cardHover: '#FDFBF7',
          border: '#EFEAE2',    // Viền cát ấm nhẹ
          borderHover: '#DECFC1',
          text: '#2C221E',      // Chữ cà phê espresso ấm
          body: '#5D4F45',      // Chữ nội dung cacao ấm
          muted: '#918072',     // Chữ phụ cát ấm dịu
          light: '#F8F4EE'
        },
        cozy: {
          bg: '#FAF8F5',
          surface: '#F5F0E8',
          card: '#FFFFFF',
          cardHover: '#FDFBF7',
          border: 'rgba(217, 119, 6, 0.15)',
          text: '#2C221E',
          muted: '#736357',
          dark: '#1C1512'
        },
        amber: {
          primary: '#F59E0B',   // Vàng mật ong ấm
          warm: '#D97706',      // Cam hổ phách
          coral: '#F97316',     // Cam đào hoàng hôn
          glow: 'rgba(245, 158, 11, 0.25)'
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
