/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0B2545', 2: '#13315C', dk: '#06192D' },
        gold: { DEFAULT: '#B8872B', bright: '#D4A017', soft: '#FFF9E8' },
        cream: '#F8F7F2',
        'off-white': '#FAF9F4',
        ink: '#0B2545',
        orange: '#E87A1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
