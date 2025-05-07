/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-green': '#10B981',
        'status-red': '#EF4444',
        'status-yellow': '#F59E0B',
        'status-purple': '#8B5CF6',
      },
    },
  },
  plugins: [],
} 