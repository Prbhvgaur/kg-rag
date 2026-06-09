// /frontend/src/lib/design.ts
export const colors = {
  bg: {
    primary: '#05070A',      // Deepest black
    secondary: '#0A0F1E',    // Dark navy surface
    tertiary: '#161B2E',     // Accent surface
    glass: 'rgba(10, 15, 30, 0.4)',
    active: 'rgba(245, 158, 11, 0.05)'
  },
  accent: {
    gold: '#F59E0B',
    goldGlow: 'rgba(245, 158, 11, 0.3)',
    blue: '#3B82F6',
    blueGlow: 'rgba(59, 130, 246, 0.3)',
    success: '#10B981',
    error: '#EF4444'
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#475569',
    accent: '#F59E0B'
  },
  border: {
    default: 'rgba(255, 255, 255, 0.06)',
    accent: 'rgba(245, 158, 11, 0.2)',
    active: 'rgba(245, 158, 11, 0.2)',
    hover: 'rgba(255, 255, 255, 0.12)'
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  },
  graph: {
    PERSON: '#3B82F6',
    ORG: '#10B981',
    CONCEPT: '#F59E0B',
    LOCATION: '#8B5CF6',
    EVENT: '#EF4444',
  }
}

export const typography = {
  fontMono: '"JetBrains Mono", "Fira Code", monospace',
  fontSans: '"Inter", system-ui, sans-serif',
}

export const animation = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '400ms ease',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}
