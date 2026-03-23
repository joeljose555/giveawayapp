/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00C896',
        'dark-navy': '#0D0D1A',
        'page-bg': '#F8F9FA',
        'card-white': '#FFFFFF',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'error-red': '#EF4444',
        'warning-amber': '#F59E0B',
        'border-grey': '#E5E7EB',
      },
    },
  },
  plugins: [],
};

