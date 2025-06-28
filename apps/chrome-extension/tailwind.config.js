/** @type {import('tailwindcss').Config} */

/**
 * https://uicolors.app/create
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/content.tsx'],
  theme: {
    extend: {
      /**
       * Corporative with the following colors:
       * - primary: '#98CA3F'
       * - secondary: '#0e272a'
       * - third: '#d8d9dd'
       *
       * Define custom colors (primary, secondary, etc):
       *
       * - "text-primary"
       * - "text-secondary"
       * - "bg-primary"
       * - "bg-secondary"
       * - "border-primary"
       * - "border-secondary"
       * - "accent-primary"
       * - "accent-secondary"
       * - "accent-tertiary"
       * - "accent-quaternary"
       * ....
       */

      colors: {
        input: '#101709',
        card: '#192014',

        /**
         * Define colors dark mode
         */
        primary: {
          light: '#98CA3F',
          /** Default dark */
          DEFAULT: '#98CA3F',
          dark: '#98CA3F',
        },
        secondary: {
          light: '#0e272a',
          DEFAULT: '#0e272a',
          dark: '#0e272a',
        },
        third: {
          light: '#d8d9dd',
          DEFAULT: '#d8d9dd',
          dark: '#d8d9dd',
        },
        gray: {
          50: '#f7f7f6',
          100: '#edeeea',
          200: '#dadcd6',
          300: '#adb2a4',
          400: '#969c8c',
          500: '#767c6b',
          600: '#5f6455',
          700: '#4c5045',
          800: '#3f4239',
          900: '#343730',
          950: '#1a1c17',
        },
        green: {
          50: '#f6fbea',
          100: '#ebf5d2',
          200: '#d6ecaa',
          300: '#bbdf77',
          400: '#98ca3f',
          500: '#81b32f',
          600: '#638f21',
          700: '#4c6d1e',
          800: '#3f571d',
          900: '#364a1d',
          950: '#1b280b',
        },
      },
    },
  },
  plugins: [],
}
