/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kfe: {
          bg: '#FAF8F4',
          surface: '#FFFFFF',
          'surface-warm': '#F5F2EC',
          text: '#2C2C2C',
          'text-secondary': '#6B6B6B',
          'text-muted': '#9A9A9A',
          border: '#E5E2DC',
          'border-strong': '#D0CCC4',
          primary: '#8B5A2B',
          'primary-dark': '#5D3A1A',
          accent: '#C67A52',
          success: '#5A9E6F',
          error: '#C4574C',
          warning: '#E9A84D',
          info: '#5B8FB9',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
    },
  },
  plugins: [],
}
