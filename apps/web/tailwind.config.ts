import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        // Brand accents. Green is reserved for verified/trust elements only.
        marigold: { DEFAULT: 'hsl(var(--marigold))', soft: 'hsl(var(--marigold-soft))' },
        green: { DEFAULT: 'hsl(var(--green))', soft: 'hsl(var(--green-soft))' },
        'violet-deep': 'hsl(var(--violet-deep))',
        // Override the built-in accent scales with brand-anchored ramps so every
        // swept accent (violet=#5A31F4, marigold=#F2A31B, green=#0E8A5C) reads as
        // the brand, coherent with the primary CTAs.
        violet: {
          50: '#F2EEFE', 100: '#E7DFFD', 200: '#CFBFFB', 300: '#B197F8', 400: '#8763F6',
          500: '#5A31F4', 600: '#4A20E4', 700: '#3C18BE', 800: '#2E1499', 900: '#241263', 950: '#160A3D',
        },
        amber: {
          50: '#FDF7E9', 100: '#FDF1DA', 200: '#FAE0AC', 300: '#F7C973', 400: '#F4B342',
          500: '#F2A31B', 600: '#D5840C', 700: '#B0640D', 800: '#8E4F12', 900: '#754112', 950: '#432105',
        },
        emerald: {
          50: '#E6F5ED', 100: '#C7E9D6', 200: '#92D5B4', 300: '#54BE8D', 400: '#22A56E',
          500: '#0E8A5C', 600: '#0A7050', 700: '#0B5940', 800: '#0C4834', 900: '#0B3B2C', 950: '#04201A',
        },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
