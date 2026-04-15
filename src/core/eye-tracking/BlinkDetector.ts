// Blink Detector - Detects eye blinks from iris data

import type { IrisData, BlinkDetection } from '../types/eye-tracking';

interface BlinkDetectionInternal {
  isBlinking: boolean;
  blinkEvent: boolean;
  eyeOpenness: number;
  lastBlinkTime: number;
}

/**
 * Blink Detector - Detects blinks from eye tracking data
 */
export class BlinkDetector {
  private history: Array<{ timestamp: number; openness: number }> = [];
  private lastBlinkTime = 0;
  private blinkThreshold = 0.25; // Eye openness threshold for blink (lower = more sensitive)
  private blinkCooldown = 150; // Minimum time between blinks (ms)

  /**
   * Process iris data and detect blinks
   */
  detect(irisData: IrisData): BlinkDetection {
    const currentOpenness = this.calculateEyeOpenness(irisData);
    const isBlinking = currentOpenness < this.blinkThreshold;
    const now = Date.now();
    let blinkEvent = false;

    // Update history
    this.history.push({ timestamp: now, openness: currentOpenness });

    // Keep only last 20 frames
    if (this.history.length > 20) {
      this.history.shift();
    }

    // Detect blink event (transition from open to closed)
    if (isBlinking && now - this.lastBlinkTime > this.blinkCooldown) {
      // Check if this is a valid blink (eyes were open before)
      const recentHistory = this.history.slice(-10);
      const wasOpen = recentHistory.some(h => h.openness > this.blinkThreshold * 1.5);

      if (wasOpen) {
        this.lastBlinkTime = now;
        blinkEvent = true;
        console.log('[BlinkDetector] Blink detected!', {
          openness: currentOpenness,
          threshold: this.blinkThreshold,
        });
      }
    }

    return {
      isBlinking,
      eyeOpenness: currentOpenness,
      lastBlinkTime: this.lastBlinkTime,
    };
  }

  /**
   * Calculate eye openness based on iris landmarks
   */
  private calculateEyeOpenness(irisData: IrisData): number {
    // Calculate eye openness based on vertical distance between eyelids
    const leftEyeOpenness = this.calculateEyeHeight(irisData.leftLandmarks);
    const rightEyeOpenness = this.calculateEyeHeight(irisData.rightLandmarks);

    // Normalize to 0-1 range
    const normalizedLeft = Math.min(leftEyeOpenness / 0.15, 1);
    const normalizedRight = Math.min(rightEyeOpenness / 0.15, 1);

    return (normalizedLeft + normalizedRight) / 2;
  }

  /**
   * Calculate eye height from landmarks
   */
  private calculateEyeHeight(landmarks: number[]): number {
    if (landmarks.length < 4) return 0.1;

    // Simple calculation: find min and max y values
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 1; i < landmarks.length; i += 2) {
      minY = Math.min(minY, landmarks[i]);
      maxY = Math.max(maxY, landmarks[i]);
    }

    return maxY - minY;
  }

  /**
   * Get blink rate (blinks per minute)
   */
  getBlinkRate(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentBlinks = this.history.filter(
      h => h.timestamp > oneMinuteAgo && h.openness < this.blinkThreshold
    ).length;

    return recentBlinks;
  }

  /**
   * Reset detector state
   */
  reset(): void {
    this.history = [];
    this.lastBlinkTime = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<{
    blinkThreshold: number;
    blinkCooldown: number;
  }>): void {
    if (config.blinkThreshold !== undefined) {
      this.blinkThreshold = config.blinkThreshold;
      console.log('[BlinkDetector] Threshold updated:', this.blinkThreshold);
    }
    if (config.blinkCooldown !== undefined) {
      this.blinkCooldown = config.blinkCooldown;
      console.log('[BlinkDetector] Cooldown updated:', this.blinkCooldown);
    }
  }
}