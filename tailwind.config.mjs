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
        body: '#3E4B63',
        muted: '#6B7280',
        line: '#E6E3D8',
        'green-inst': '#00704A',
        'green-soft': '#E8F7F0',
        orange: '#E87A1C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      maxWidth: { 'content': '1200px' },
      boxShadow: {
        'card-hover': '0 24px 40px -20px rgba(11,37,69,0.15)',
        'card-lift': '0 30px 50px -20px rgba(11,37,69,0.18)',
        'hero': '0 40px 80px -20px rgba(11,37,69,0.3)',
      },
    },
  },
  plugins: [],
};
