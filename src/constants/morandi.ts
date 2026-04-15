// Morandi Color Palette

export const MORANDI_COLORS = {
  // Primary Morandi Palette
  primary: {
    slate: '#8B919E',
    sage: '#8A9A7D',
    dustyRose: '#B5837A',
    dustyBlue: '#7F95A8',
    dustyLavender: '#9E8DA9',
  },

  // Background Colors
  background: {
    primary: '#F5F3F0',   // Warm cream
    secondary: '#E8E4DF',  // Warm gray
    tertiary: '#DDD8D2',   // Darker gray
  },

  // Text Colors
  text: {
    primary: '#3D3A3D',    // Deep warm gray
    secondary: '#5D575D',  // Medium gray
    tertiary: '#8B858B',   // Light gray
    disabled: '#B0AAB0',   // Very light gray
  },

  // Accent Colors
  accent: {
    subtle: '#9E8DA9',     // Soft lavender
    calm: '#8A9A7D',       // Sage green
    warm: '#B5837A',       // Dusty rose
  },

  // Focus Mode Colors
  focus: {
    background: '#F7F5F3',
    highlight: '#E8E4DF',
    text: '#4A4649',
  },

  // UI Elements
  ui: {
    border: '#D8D3CD',
    shadow: 'rgba(61, 58, 61, 0.08)',
    hover: '#E8E4DF',
    active: '#DDD8D2',
  },

  // Breathing Animation Colors
  breathing: {
    inhale: 'rgba(138, 154, 125, 0.1)',
    exhale: 'rgba(181, 131, 122, 0.1)',
    pause: 'rgba(158, 141, 169, 0.1)',
  },
} as const;

// Color combinations for different themes
export const COLOR_SCHEMES = {
  default: {
    background: MORANDI_COLORS.background.primary,
    text: MORANDI_COLORS.text.primary,
    accent: MORANDI_COLORS.primary.slate,
  },
  calm: {
    background: MORANDI_COLORS.background.primary,
    text: MORANDI_COLORS.text.primary,
    accent: MORANDI_COLORS.primary.sage,
  },
  warm: {
    background: '#FDF9F6',
    text: MORANDI_COLORS.text.primary,
    accent: MORANDI_COLORS.primary.dustyRose,
  },
  cool: {
    background: '#F3F5F7',
    text: MORANDI_COLORS.text.primary,
    accent: MORANDI_COLORS.primary.dustyBlue,
  },
} as const;
