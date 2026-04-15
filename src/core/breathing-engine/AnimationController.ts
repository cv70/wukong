// Animation Controller for Breathing Typography

import type { BreathingConfig, BreathingState } from '../types/breathing';

export interface AnimationCallback {
  (phase: BreathingState['phase'], progress: number): void;
}

/**
 * Animation Controller - Manages the breathing animation loop
 */
export class AnimationController {
  private config: BreathingConfig;
  private state: BreathingState;
  private rafId: number | null = null;
  private callbacks: Set<AnimationCallback> = new Set();
  private lastTime = 0;
  private phaseProgress = 0;
  private currentPhase: BreathingState['phase'] = 'inhale';

  constructor(config: BreathingConfig) {
    this.config = config;
    this.state = {
      phase: 'inhale',
      progress: 0,
      frame: 0,
      lastTimestamp: 0,
    };
  }

  /**
   * Update the breathing configuration
   */
  updateConfig(config: Partial<BreathingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start the animation loop
   */
  start(): void {
    if (this.rafId !== null) return;

    this.lastTime = performance.now();
    this.phaseProgress = 0;
    this.currentPhase = 'inhale';

    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Pause the animation
   */
  pause(): void {
    this.config.enabled = false;
  }

  /**
   * Resume the animation
   */
  resume(): void {
    this.config.enabled = true;
  }

  /**
   * Register a callback for animation updates
   */
  addCallback(callback: AnimationCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: AnimationCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.callbacks.clear();
  }

  /**
   * Get current state
   */
  getState(): BreathingState {
    return { ...this.state };
  }

  /**
   * Main animation tick
   */
  private tick(timestamp: number): void {
    const deltaTime = timestamp - this.lastTime;

    if (this.config.enabled) {
      this.update(deltaTime);
    }

    // Notify callbacks
    this.callbacks.forEach(cb => cb(this.currentPhase, this.phaseProgress));

    // Update state
    this.state = {
      phase: this.currentPhase,
      progress: this.phaseProgress,
      frame: this.state.frame + 1,
      lastTimestamp: timestamp,
    };

    this.lastTime = timestamp;
    this.rafId = requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Update breathing phase and progress
   */
  private update(deltaTime: number): void {
    const { speed } = this.config;

    // Calculate phase durations based on speed
    const baseCycleDuration = 1000 / speed; // ms per cycle
    const phaseDuration = baseCycleDuration / 3;

    // Update progress
    this.phaseProgress += deltaTime / phaseDuration;

    if (this.phaseProgress >= 1) {
      this.phaseProgress = 0;
      this.transitionPhase();
    }
  }

  /**
   * Transition to next breathing phase
   */
  private transitionPhase(): void {
    const phases: BreathingState['phase'][] = ['inhale', 'pause', 'exhale'];
    const currentIndex = phases.indexOf(this.currentPhase);
    this.currentPhase = phases[(currentIndex + 1) % phases.length];
  }

  /**
   * Apply breathing effect to an element
   */
  static applyBreathingEffect(
    element: HTMLElement,
    phase: BreathingState['phase'],
    progress: number,
    amplitude: number
  ): void {
    const offset = amplitude * Math.sin(progress * Math.PI * 2);

    switch (phase) {
      case 'inhale':
        element.style.transform = `translateY(${offset}px) scale(${1 + offset * 0.001})`;
        element.style.opacity = '1';
        break;
      case 'exhale':
        element.style.transform = `translateY(${-offset}px) scale(${1 - offset * 0.001})`;
        element.style.opacity = '1';
        break;
      case 'pause':
        element.style.transform = 'none';
        element.style.opacity = '1';
        break;
    }
  }

  /**
   * Get breathing CSS variable value for a phase
   */
  static getBreathingVariable(
    _phase: BreathingState['phase'],
    progress: number,
    amplitude: number
  ): string {
    const base = Math.sin(progress * Math.PI * 2);
    return `${base * amplitude}px`;
  }
}