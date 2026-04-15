// Breathing Typography Engine Types

export interface BreathingConfig {
  /** Breathing speed in Hz (0.1 - 0.3) */
  speed: number;
  /** Amplitude of breathing motion (0.5 - 2.0) */
  amplitude: number;
  /** Whether breathing animation is enabled */
  enabled: boolean;
}

export interface TextMetrics {
  /** Number of characters */
  characterCount: number;
  /** Number of words */
  wordCount: number;
  /** Number of sentences */
  sentenceCount: number;
  /** Average words per sentence */
  avgWordsPerSentence: number;
  /** Complexity score (0-100) */
  complexityScore: number;
  /** Suggested line height multiplier */
  lineHeightMultiplier: number;
  /** Suggested letter spacing in em */
  letterSpacing: string;
}

export interface BreathingState {
  /** Current breathing phase */
  phase: 'inhale' | 'exhale' | 'pause';
  /** Current progress through phase (0-1) */
  progress: number;
  /** Current animation frame */
  frame: number;
  /** Last timestamp */
  lastTimestamp: number;
}

export interface ParagraphMetrics {
  id: string;
  text: string;
  sentences: SentenceMetrics[];
  metrics: TextMetrics;
  isVisible: boolean;
}

export interface SentenceMetrics {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  complexityScore: number;
  emphasisWords: string[];
}

export interface BreathingAnimationTarget {
  /** Target CSS variable name */
  variable: '--breathing-offset';
  /** Target element */
  element: HTMLElement;
  /** Base value */
  baseValue: number;
}
