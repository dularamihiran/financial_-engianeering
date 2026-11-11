/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        navy: '#1E3A8A',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#F59E0B',
        surface: '#F8FAFC',
        ink: '#0F172A',
        muted: '#64748B',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
