/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design palette
        navy: '#2F4156',
        teal: '#567C8D',
        'sky-blue': '#C8D9E6',
        'sky-soft': '#E3ECF2',
        beige: '#F5EFEB',
        'beige-deep': '#ECE3DC',
        paper: '#FAF6F2',
        // Legacy ink scale (kept for backward compat)
        ink: {
          50: '#f7f7f8',
          100: '#ececef',
          200: '#d4d4da',
          300: '#a9a9b3',
          400: '#7c7c89',
          500: '#52525c',
          600: '#3a3a42',
          700: '#27272d',
          800: '#1a1a1f',
          900: '#0f0f10',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        'sans-medium': ['Inter_500Medium', 'sans-serif'],
        'sans-semibold': ['Inter_600SemiBold', 'sans-serif'],
        'sans-bold': ['Inter_700Bold', 'sans-serif'],
        serif: [
          'CormorantGaramond_400Regular',
          'CormorantGaramond_500Medium',
          'Georgia',
          'serif',
        ],
        'serif-italic': [
          'CormorantGaramond_400Regular_Italic',
          'Georgia',
          'serif',
        ],
        'serif-medium': ['CormorantGaramond_500Medium', 'Georgia', 'serif'],
        'serif-semibold': ['CormorantGaramond_600SemiBold', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        pill: '999px',
      },
    },
  },
  plugins: [],
};
