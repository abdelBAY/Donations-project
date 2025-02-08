/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors
        dark: {
          DEFAULT: '#042f4e',
          50: '#0a4a7a',
          100: '#0d5c96',
          200: '#1373b4',
          300: '#2089d1',
          400: '#3aa0e9',
          500: '#63b3ed',
          600: '#90cff4',
          700: '#bce3fa',
          800: '#e1f2fd',
          900: '#f0f9ff',
        },
        // Light mode colors remain unchanged
        light: {
          DEFAULT: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      backgroundColor: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
      },
      borderColor: {
        primary: 'var(--color-border-primary)',
        secondary: 'var(--color-border-secondary)',
      },
    },
  },
  plugins: [],
};