// Breathing Constants

export const BREATHING_CONFIG = {
  MIN_SPEED: 0.1,      // Hz - very slow breathing
  MAX_SPEED: 0.3,      // Hz - faster breathing
  DEFAULT_SPEED: 0.15, // Hz - optimal for reading
  MIN_AMPLITUDE: 0.5,  // Subtle motion
  MAX_AMPLITUDE: 2.0,  // Pronounced motion
  DEFAULT_AMPLITUDE: 1.0,
} as const;

export const COMPLEXITY_THRESHOLDS = {
  LOW: 30,       // Simple text
  MEDIUM: 60,    // Medium complexity
  HIGH: 80,      // Complex text
} as const;

export const LINE_HEIGHT_MAP = {
  LOW: 1.4,      // Simple text - tighter
  MEDIUM: 1.6,   // Medium - balanced
  HIGH: 1.8,     // Complex - more spacing
} as const;

export const LETTER_SPACING_MAP = {
  LOW: 0.01,     // Simple - tighter
  MEDIUM: 0.02,  // Medium - balanced
  HIGH: 0.03,    // Complex - more spacing
} as const;

export const BREATHING_PHASES = {
  INHALE_DURATION: 4000,   // 4 seconds
  PAUSE_DURATION: 1000,   // 1 second
  EXHALE_DURATION: 4000,  // 4 seconds
} as const;

export const ADAPTIVE_THRESHOLDS = {
  HIGH_FOCUS: 70,         // Focus score threshold for faster breathing
  LOW_FOCUS: 30,          // Focus score threshold for slower breathing
  FATIGUE_SCORE: 50,       // Fatigue threshold for slowing down
} as const;
