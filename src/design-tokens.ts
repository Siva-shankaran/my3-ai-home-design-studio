/**
 * MY3 Designs — Editorial Architectural Design Tokens
 * 
 * Strict architectural studio and editorial magazine aesthetic:
 * - Palette: Paper #F4F1EA, Ink #161513, Muted #8A857B, Dark #1B1A18, Terracotta #C4552D
 * - Typography: Fraunces / Instrument Serif + Inter Tight / DM Sans
 * - Geometric hairpins: 1px hairline dividers (#E0DBD1), 4-8px radius, tight tracking
 */

export const tokens = {
  colors: {
    paper: '#F4F1EA',
    paper2: '#FAF8F5',
    paper3: '#EAE5DB',
    ink: '#161513',
    ink2: '#2C2A26',
    muted: '#8A857B',
    dark: '#1B1A18',
    dark2: '#242220',
    terracotta: '#C4552D',
    terracottaHover: '#A94420',
    terracottaSubtle: '#F9EFEB',
    rule: '#E0DBD1',
    rule2: '#CBC4B6',
    white: '#FFFFFF',
    black: '#000000'
  },
  fonts: {
    display: '"Fraunces", "Instrument Serif", Georgia, serif',
    editorial: '"Instrument Serif", "Fraunces", Georgia, serif',
    body: '"Inter Tight", "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace'
  },
  radii: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    pill: '9999px'
  },
  borders: {
    hairline: '1px solid #E0DBD1',
    hairlineDark: '1px solid #2E2B27',
    hairlineAccent: '1px solid #C4552D'
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1440
  },
  transitions: {
    fast: '0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  }
} as const;

export type DesignTokens = typeof tokens;
