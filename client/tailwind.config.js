/** @type {import('tailwindcss').Config} */
// Palette and type follow the Wix "Plumber (Traditional)" template:
// signal orange on ink, warm cream surfaces, tight grotesk + wide labels.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF4EE',
          100: '#FFE6D9',
          200: '#FFCBB0',
          300: '#FFA67A',
          400: '#FF7A3D',
          500: '#FF5706',
          600: '#EB4D00',
          700: '#B83C00',
          800: '#8F2F00',
          900: '#5C1E00',
        },
        // Warm neutrals replace Tailwind's cool slate everywhere it is used.
        slate: {
          50: '#FDF7F5',
          100: '#F4EEEB',
          200: '#E8E1DE',
          300: '#D6CCC7',
          400: '#A89D98',
          500: '#7A706B',
          600: '#5C5450',
          700: '#3F3936',
          800: '#252120',
          900: '#0A0A0A',
        },
        ink: '#0A0A0A',
        cream: '#FDF7F5',
        sand: '#E8E1DE',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        wide: ['Unbounded', '"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.03em',
        label: '0.16em',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
};
