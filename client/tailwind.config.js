/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: '#0d131f',
          sidebarHover: '#172033',
          sidebarActive: '#2563eb',
          slateBg: '#f8fafc',
          cardBorder: '#e2e8f0',
        },
        ota: {
          airbnb: '#FF5A5F',
          booking: '#003580',
          guesty: '#10b981',
          direct: '#ec4899',
          lodgify: '#f59e0b',
          other: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
