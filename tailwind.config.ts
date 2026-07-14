import type { Config } from 'tailwindcss';
import { businessInputs } from './src/config/business';

const c = businessInputs.design;

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: c.primaryColor,
        'primary-dark': c.primaryDarkColor,
        'primary-soft': c.primarySoftColor ?? '#E8EFE9',
        secondary: c.accentColor,
        'secondary-soft': c.secondarySoftColor ?? '#F5EDD8',
        accent: c.accentColor,
        background: c.backgroundColor,
        surface: c.backgroundColor,
        'surface-rose': c.surfaceRoseColor ?? '#F5F0E5',
        card: c.cardColor,
        ink: c.textColor,
        foreground: c.textColor,
        muted: c.mutedTextColor,
        border: c.borderColor,
      },
      fontFamily: {
        arabic: ['"Noto Kufi Arabic"', 'Tahoma', 'sans-serif'],
        latin: ['system-ui', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(19, 78, 58, 0.08)',
        card: '0 4px 24px rgba(19, 78, 58, 0.06)',
        xl: '0 20px 50px rgba(19, 78, 58, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
