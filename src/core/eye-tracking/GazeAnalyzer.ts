// Gaze Analyzer - Analyzes gaze patterns

import type { IrisData, GazeData, Fixation } from '../types/eye-tracking';

/**
 * Gaze Analyzer - Analyzes eye gaze patterns
 */
export class GazeAnalyzer {
  private gazeHistory: Array<{ x: number; y: number; timestamp: number }> = [];
  private maxHistoryLength = 60;
  private fixationThreshold = 50; // pixels
  private minFixationDuration = 200; // ms
  private currentFixation: Fixation | null = null;

  /**
   * Process iris data and analyze gaze
   */
  analyze(irisData: IrisData): GazeData {
    // Calculate gaze point (average of both eyes)
    const gazePoint = {
      x: (irisData.leftIris.x + irisData.rightIris.x) / 2,
      y: (irisData.leftIris.y + irisData.rightIris.y) / 2,
    };

    // Add to history
    this.gazeHistory.push({
      x: gazePoint.x,
      y: gazePoint.y,
      timestamp: irisData.timestamp,
    });

    // Trim history
    if (this.gazeHistory.length > this.maxHistoryLength) {
      this.gazeHistory.shift();
    }

    // Calculate velocity and direction
    const { velocity, direction, angle } = this.calculateVelocityAndDirection();

    // Update fixations
    this.updateFixations(gazePoint, irisData.timestamp);

    return {
      gazePoint,
      gazeVelocity: velocity,
      gazeDirection: direction,
      gazeAngle: angle,
      fixations: this.getRecentFixations(),
    };
  }

  /**
   * Calculate gaze velocity and direction
   */
  private calculateVelocityAndDirection(): {
    velocity: number;
    direction: { x: number; y: number };
    angle: number;
  } {
    if (this.gazeHistory.length < 2) {
      return { velocity: 0, direction: { x: 0, y: 0 }, angle: 0 };
    }

    const recent = this.gazeHistory.slice(-10);
    if (recent.length < 2) {
      return { velocity: 0, direction: { x: 0, y: 0 }, angle: 0 };
    }

    const dx = recent[recent.length - 1].x - recent[0].x;
    const dy = recent[recent.length - 1].y - recent[0].y;
    const dt = recent[recent.length - 1].timestamp - recent[0].timestamp;

    if (dt === 0) {
      return { velocity: 0, direction: { x: 0, y: 0 }, angle: 0 };
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = (distance * 1000) / dt; // pixels per second

    // Calculate normalized direction
    const direction = distance > 0
      ? { x: dx / distance, y: dy / distance }
      : { x: 0, y: 0 };

    // Calculate angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { velocity, direction, angle };
  }

  /**
   * Update fixations
   */
  private updateFixations(gazePoint: { x: number; y: number }, timestamp: number): void {
    // Check if we're still in the current fixation area
    if (this.currentFixation) {
      const dx = gazePoint.x - this.currentFixation.x;
      const dy = gazePoint.y - this.currentFixation.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.fixationThreshold) {
        // Still in fixation area
        this.currentFixation.endTime = timestamp;
        this.currentFixation.duration = timestamp - this.currentFixation.startTime;
        return;
      } else {
        // Fixation ended
        if (this.currentFixation.duration >= this.minFixationDuration) {
          // Valid fixation
        }
        this.currentFixation = null;
      }
    }

    // Start new fixation
    this.currentFixation = {
      startTime: timestamp,
      endTime: timestamp,
      x: gazePoint.x,
      y: gazePoint.y,
      duration: 0,
    };
  }

  /**
   * Get recent fixations
   */
  private getRecentFixations(): Fixation[] {
    // This is simplified - in production, maintain a proper list of fixations
    if (this.currentFixation && this.currentFixation.duration >= this.minFixationDuration) {
      return [this.currentFixation];
    }
    return [];
  }

  /**
   * Check if gaze is stable (low velocity)
   */
  isGazeStable(): boolean {
    const { velocity } = this.calculateVelocityAndDirection();
    return velocity < 100; // pixels per second
  }

  /**
   * Reset analyzer state
   */
  reset(): void {
    this.gazeHistory = [];
    this.currentFixation = null;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<{
    maxHistoryLength: number;
    fixationThreshold: number;
    minFixationDuration: number;
  }>): void {
    if (config.maxHistoryLength !== undefined) {
      this.maxHistoryLength = config.maxHistoryLength;
      this.gazeHistory = this.gazeHistory.slice(-this.maxHistoryLength);
    }
    if (config.fixationThreshold !== undefined) {
      this.fixationThreshold = config.fixationThreshold;
    }
    if (config.minFixationDuration !== undefined) {
      this.minFixationDuration = config.minFixationDuration;
    }
  }
}