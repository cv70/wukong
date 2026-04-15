// Eye Tracking Types

export interface EyeTrackingState {
  /** Whether eye tracking is active */
  isActive: boolean;
  /** Whether camera is initialized */
  isInitialized: boolean;
  /** Current focus score (0-100) */
  focusScore: number;
  /** Average focus over last 30 seconds */
  averageFocusScore: number;
  /** Last blink timestamp */
  lastBlink: number;
  /** Blink count in current session */
  blinkCount: number;
  /** Whether user is tired (low blink rate) */
  isTired: boolean;
  /** Error message if any */
  error: string | null;
}

export interface IrisData {
  /** Left eye iris coordinates (normalized 0-1) */
  leftIris: { x: number; y: number };
  /** Right eye iris coordinates (normalized 0-1) */
  rightIris: { x: number; y: number };
  /** Left eye landmarks */
  leftLandmarks: number[];
  /** Right eye landmarks */
  rightLandmarks: number[];
  /** Detection confidence (0-1) */
  confidence: number;
  /** Timestamp */
  timestamp: number;
}

export interface BlinkDetection {
  /** Whether a blink was detected */
  isBlinking: boolean;
  /** Current eye openness (0-1) */
  eyeOpenness: number;
  /** Timestamp of last blink */
  lastBlinkTime: number;
}

export interface GazeData {
  /** Normalized gaze point (0-1) */
  gazePoint: { x: number; y: number };
  /** Gaze velocity (pixels/second) */
  gazeVelocity: number;
  /** Gaze direction vector (dx, dy) normalized */
  gazeDirection: { x: number; y: number };
  /** Gaze direction as angle in degrees */
  gazeAngle: number;
  /** Gaze fixations detected */
  fixations: Fixation[];
}

export interface Fixation {
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  duration: number;
}

export interface FocusMetrics {
  /** Current focus score (0-100) */
  score: number;
  /** Focus trend (improving, stable, declining) */
  trend: 'improving' | 'stable' | 'declining';
  /** Suggested breathing speed adjustment */
  suggestedSpeedAdjustment: number;
  /** Fatigue indicator (0-100) */
  fatigueScore: number;
}

export interface EyeTrackingConfig {
  /** Whether eye tracking is enabled */
  enabled: boolean;
  /** Camera facing mode */
  facingMode: 'user' | 'environment';
  /** Minimum confidence threshold */
  minConfidence: number;
  /** Smoothing factor for gaze */
  smoothingFactor: number;
  /** Whether to show camera preview */
  showPreview: boolean;
}
