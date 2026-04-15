// Focus Calculator - Calculates focus score from eye tracking data

import type { BlinkDetection, GazeData, FocusMetrics } from '../types/eye-tracking';

/**
 * Focus Calculator - Calculates focus score
 */
export class FocusCalculator {
  private recentBlinkTimes: number[] = [];
  private gazeStabilityHistory: boolean[] = [];
  private maxHistorySize = 30;
  private currentFocusScore = 50; // Start at neutral
  private fatigueScore = 0;

  /**
   * Calculate focus score from blink and gaze data
   */
  calculate(blinkDetection: BlinkDetection, gazeData: GazeData): FocusMetrics {
    const now = Date.now();

    // Update blink history
    if (blinkDetection.lastBlinkTime > 0) {
      this.recentBlinkTimes.push(blinkDetection.lastBlinkTime);
    }

    // Keep only recent blinks (last 30 seconds)
    const thirtySecondsAgo = now - 30000;
    this.recentBlinkTimes = this.recentBlinkTimes.filter(t => t > thirtySecondsAgo);

    // Update gaze stability
    const isStable = this.gazeVelocityToStability(gazeData.gazeVelocity);
    this.gazeStabilityHistory.push(isStable);
    if (this.gazeStabilityHistory.length > this.maxHistorySize) {
      this.gazeStabilityHistory.shift();
    }

    // Calculate components
    const blinkScore = this.calculateBlinkScore();
    const gazeScore = this.calculateGazeScore();
    const fatigueScore = this.calculateFatigueScore();

    // Weighted average of components
    const newFocusScore = Math.round(
      blinkScore * 0.4 + gazeScore * 0.4 + (100 - fatigueScore) * 0.2
    );

    // Smooth the score
    this.currentFocusScore = this.smoothScore(newFocusScore);
    this.fatigueScore = fatigueScore;

    // Determine trend
    const trend = this.calculateTrend();

    // Calculate speed adjustment suggestion
    const speedAdjustment = this.calculateSpeedAdjustment();

    return {
      score: this.currentFocusScore,
      trend,
      suggestedSpeedAdjustment: speedAdjustment,
      fatigueScore: this.fatigueScore,
    };
  }

  /**
   * Calculate blink-based score
   */
  private calculateBlinkScore(): number {
    // Normal blink rate: 15-20 blinks per minute
    const blinkRate = this.recentBlinkTimes.length * 2; // *2 because 30 seconds -> 1 minute

    if (blinkRate < 10) {
      // Too few blinks - might be staring
      return 60;
    } else if (blinkRate > 30) {
      // Too many blinks - might be distracted
      return 60;
    } else {
      // Normal blink rate
      return 90;
    }
  }

  /**
   * Calculate gaze-based score
   */
  private calculateGazeScore(): number {
    if (this.gazeStabilityHistory.length === 0) return 50;

    const stableCount = this.gazeStabilityHistory.filter(s => s).length;
    const stabilityRatio = stableCount / this.gazeStabilityHistory.length;

    return Math.round(stabilityRatio * 100);
  }

  /**
   * Convert gaze velocity to stability
   */
  private gazeVelocityToStability(velocity: number): boolean {
    // Low velocity = stable
    return velocity < 150; // pixels per second
  }

  /**
   * Calculate fatigue score (0-100, higher = more fatigued)
   */
  private calculateFatigueScore(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentBlinks = this.recentBlinkTimes.filter(t => t > oneMinuteAgo).length;

    // Very few blinks over time indicates fatigue
    if (recentBlinks < 5) {
      this.fatigueScore = Math.min(this.fatigueScore + 2, 100);
    } else if (recentBlinks > 15) {
      this.fatigueScore = Math.max(this.fatigueScore - 1, 0);
    }

    // Slowly decrease fatigue over time
    this.fatigueScore = Math.max(this.fatigueScore - 0.5, 0);

    return Math.round(this.fatigueScore);
  }

  /**
   * Smooth focus score changes
   */
  private smoothScore(newScore: number): number {
    const smoothingFactor = 0.3;
    return Math.round(
      this.currentFocusScore + smoothingFactor * (newScore - this.currentFocusScore)
    );
  }

  /**
   * Calculate focus trend
   */
  private calculateTrend(): 'improving' | 'stable' | 'declining' {
    if (this.gazeStabilityHistory.length < 10) return 'stable';

    const recent = this.gazeStabilityHistory.slice(-10);
    const older = this.gazeStabilityHistory.slice(-20, -10);

    const recentStable = recent.filter(s => s).length / recent.length;
    const olderStable = older.length > 0
      ? older.filter(s => s).length / older.length
      : recentStable;

    const diff = recentStable - olderStable;

    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Calculate suggested speed adjustment
   */
  private calculateSpeedAdjustment(): number {
    // Higher focus = positive adjustment (faster breathing)
    // Lower focus = negative adjustment (slower breathing)
    const focusFactor = (this.currentFocusScore - 50) / 50; // -1 to 1

    return focusFactor * 0.1; // Max +/- 0.1 adjustment
  }

  /**
   * Reset calculator state
   */
  reset(): void {
    this.recentBlinkTimes = [];
    this.gazeStabilityHistory = [];
    this.currentFocusScore = 50;
    this.fatigueScore = 0;
  }

  /**
   * Get current focus score
   */
  getCurrentFocusScore(): number {
    return this.currentFocusScore;
  }
}