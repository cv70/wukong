// Eye Tracking Manager - Main manager for eye tracking

import { IrisTracker } from './IrisTracker';
import { BlinkDetector } from './BlinkDetector';
import { GazeAnalyzer } from './GazeAnalyzer';
import { FocusCalculator } from './FocusCalculator';
import type { EyeTrackingState, EyeTrackingConfig, IrisData } from '../types/eye-tracking';

export interface EyeTrackingOptions {
  config?: Partial<EyeTrackingConfig>;
  onFocusChange?: (focusScore: number) => void;
  onStateChange?: (state: EyeTrackingState) => void;
  onIrisData?: (irisData: IrisData) => void;
}

/**
 * Eye Tracking Manager - Manages all eye tracking components
 */
export class EyeTrackingManager {
  private irisTracker: IrisTracker;
  private blinkDetector: BlinkDetector;
  private gazeAnalyzer: GazeAnalyzer;
  private focusCalculator: FocusCalculator;
  private config: EyeTrackingConfig;
  private state: EyeTrackingState;
  private updateInterval: number | null = null;
  private callbacks: Set<(focusScore: number) => void> = new Set();
  private stateCallbacks: Set<(state: EyeTrackingState) => void> = new Set();
  private irisDataCallbacks: Set<(irisData: IrisData) => void> = new Set();

  constructor(options: EyeTrackingOptions = {}) {
    this.config = {
      enabled: false,
      facingMode: 'user',
      minConfidence: 0.7,
      smoothingFactor: 0.3,
      showPreview: false,
      ...options.config,
    };

    this.state = {
      isActive: false,
      isInitialized: false,
      focusScore: 50,
      averageFocusScore: 50,
      lastBlink: 0,
      blinkCount: 0,
      isTired: false,
      error: null,
    };

    this.irisTracker = new IrisTracker();
    this.blinkDetector = new BlinkDetector();
    this.gazeAnalyzer = new GazeAnalyzer();
    this.focusCalculator = new FocusCalculator();

    if (options.onFocusChange) {
      this.callbacks.add(options.onFocusChange);
    }
    if (options.onStateChange) {
      this.stateCallbacks.add(options.onStateChange);
    }
    if (options.onIrisData) {
      this.irisDataCallbacks.add(options.onIrisData);
    }

    // Set up iris tracker callback
    this.irisTracker.onResults(this.handleIrisData.bind(this));
  }

  /**
   * Initialize eye tracking
   */
  async initialize(): Promise<boolean> {
    try {
      const success = await this.irisTracker.initialize();
      this.state.isInitialized = success;
      this.notifyStateChange();

      if (!success) {
        this.state.error = 'Failed to initialize MediaPipe Iris';
      }

      return success;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyStateChange();
      return false;
    }
  }

  /**
   * Start eye tracking with video element
   */
  async start(videoElement: HTMLVideoElement): Promise<boolean> {
    if (!this.config.enabled) {
      this.state.error = 'Eye tracking is disabled in settings';
      this.notifyStateChange();
      return false;
    }

    try {
      const success = await this.irisTracker.start(videoElement);

      if (success) {
        this.state.isActive = true;
        this.state.error = null;

        // Start periodic updates
        this.updateInterval = window.setInterval(() => {
          this.updateAverageFocus();
        }, 1000);

        this.notifyStateChange();
      } else {
        this.state.error = 'Failed to start camera';
      }

      return success;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyStateChange();
      return false;
    }
  }

  /**
   * Stop eye tracking
   */
  async stop(): Promise<void> {
    await this.irisTracker.stop();

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.state.isActive = false;
    this.state.focusScore = 50;
    this.state.averageFocusScore = 50;
    this.notifyStateChange();
  }

  /**
   * Handle iris data from tracker
   */
  private handleIrisData(irisData: IrisData): void {
    try {
      // Detect blinks
      const blinkDetection = this.blinkDetector.detect(irisData);

      // Analyze gaze
      const gazeData = this.gazeAnalyzer.analyze(irisData);

      // Log eye tracking data for debugging
      console.log('[EyeTracking]', {
        timestamp: new Date().toISOString(),
        leftIris: irisData.leftIris,
        rightIris: irisData.rightIris,
        eyeOpenness: blinkDetection.eyeOpenness,
        isBlinking: blinkDetection.isBlinking,
        gazeVelocity: gazeData.gazeVelocity.toFixed(2),
        gazeDirection: gazeData.gazeDirection,
        gazeAngle: gazeData.gazeAngle.toFixed(1),
      });

      // Calculate focus
      const focusMetrics = this.focusCalculator.calculate(blinkDetection, gazeData);

      // Update state
      this.state.focusScore = focusMetrics.score;
      this.state.isTired = focusMetrics.fatigueScore > 50;

      // Check for new blink event
      if (blinkDetection.isBlinking && blinkDetection.lastBlinkTime > this.state.lastBlink) {
        this.state.lastBlink = blinkDetection.lastBlinkTime;
        this.state.blinkCount++;
        console.log('[EyeTracking] Blink count updated:', this.state.blinkCount);
      }

      // Notify callbacks
      this.callbacks.forEach(cb => cb(this.state.focusScore));
      this.irisDataCallbacks.forEach(cb => cb(irisData));
      this.notifyStateChange();
    } catch (error) {
      console.error('[EyeTracking] Error processing iris data:', error);
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyStateChange();
    }
  }

  /**
   * Update average focus score
   */
  private updateAverageFocus(): void {
    const current = this.state.focusScore;
    const average = this.state.averageFocusScore;

    // Simple moving average
    this.state.averageFocusScore = Math.round(average * 0.9 + current * 0.1);
  }

  /**
   * Notify state change callbacks
   */
  private notifyStateChange(): void {
    this.stateCallbacks.forEach(cb => cb(this.state));
  }

  /**
   * Add focus change callback
   */
  addFocusCallback(callback: (focusScore: number) => void): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove focus change callback
   */
  removeFocusCallback(callback: (focusScore: number) => void): void {
    this.callbacks.delete(callback);
  }

  /**
   * Add state change callback
   */
  addStateCallback(callback: (state: EyeTrackingState) => void): void {
    this.stateCallbacks.add(callback);
  }

  /**
   * Remove state change callback
   */
  removeStateCallback(callback: (state: EyeTrackingState) => void): void {
    this.stateCallbacks.delete(callback);
  }

  /**
   * Add iris data callback
   */
  addIrisDataCallback(callback: (irisData: IrisData) => void): void {
    this.irisDataCallbacks.add(callback);
  }

  /**
   * Remove iris data callback
   */
  removeIrisDataCallback(callback: (irisData: IrisData) => void): void {
    this.irisDataCallbacks.delete(callback);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EyeTrackingConfig>): void {
    this.config = { ...this.config, ...config };

    // Update component configs
    this.blinkDetector.updateConfig({
      blinkThreshold: config.minConfidence ? 1 - config.minConfidence : undefined,
    });
    this.gazeAnalyzer.updateConfig({});
  }

  /**
   * Get current state
   */
  getState(): EyeTrackingState {
    return { ...this.state };
  }

  /**
   * Get current configuration
   */
  getConfig(): EyeTrackingConfig {
    return { ...this.config };
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.state.isInitialized;
  }

  /**
   * Check if active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.stop();
    this.irisTracker.dispose();
    this.blinkDetector.reset();
    this.gazeAnalyzer.reset();
    this.focusCalculator.reset();
    this.callbacks.clear();
    this.stateCallbacks.clear();
    this.irisDataCallbacks.clear();
  }
}

/**
 * Singleton instance
 */
let eyeTrackingInstance: EyeTrackingManager | null = null;

export function getEyeTrackingManager(options?: EyeTrackingOptions): EyeTrackingManager {
  if (!eyeTrackingInstance) {
    eyeTrackingInstance = new EyeTrackingManager(options);
  }
  return eyeTrackingInstance;
}

export function disposeEyeTrackingManager(): void {
  if (eyeTrackingInstance) {
    eyeTrackingInstance.dispose();
    eyeTrackingInstance = null;
  }
}