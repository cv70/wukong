// Breathing Engine - Main Engine for Breathing Typography

import { TextAnalyzer } from './TextAnalyzer';
import { AnimationController } from './AnimationController';
import { getIntersectionObserver, IntersectionObserverManager } from './IntersectionObserver';
import type { BreathingConfig, ParagraphMetrics, BreathingState } from '../types/breathing';

export interface BreathingEngineOptions {
  config?: Partial<BreathingConfig>;
  onPhaseChange?: (phase: BreathingState['phase'], progress: number) => void;
}

/**
 * Breathing Engine - Orchestrates breathing typography animation
 */
export class BreathingEngine {
  private analyzer: TextAnalyzer;
  private animationController: AnimationController;
  private intersectionObserver: IntersectionObserverManager;
  private paragraphs: Map<string, ParagraphMetrics> = new Map();
  private elements: Map<string, HTMLElement> = new Map();
  private config: BreathingConfig;

  constructor(options: BreathingEngineOptions = {}) {
    this.config = {
      speed: 0.15,
      amplitude: 1.0,
      enabled: true,
      ...options.config,
    };

    this.analyzer = new TextAnalyzer();
    this.animationController = new AnimationController(this.config);
    this.intersectionObserver = getIntersectionObserver();

    if (options.onPhaseChange) {
      this.animationController.addCallback(options.onPhaseChange);
    }
  }

  /**
   * Initialize the engine with text
   */
  initialize(text: string): ParagraphMetrics[] {
    const paragraphs = this.parseText(text);
    this.paragraphs.clear();
    paragraphs.forEach(p => this.paragraphs.set(p.id, p));
    return paragraphs;
  }

  /**
   * Parse text into paragraphs
   */
  private parseText(text: string): ParagraphMetrics[] {
    const paragraphs: ParagraphMetrics[] = [];

    // Split by double newlines
    const paragraphTexts = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    paragraphTexts.forEach((pText, index) => {
      const metrics = this.analyzer.analyzeParagraph(pText.trim(), index);
      paragraphs.push(metrics);
    });

    return paragraphs;
  }

  /**
   * Register a paragraph element for animation
   */
  registerParagraph(element: HTMLElement, paragraphId: string): void {
    const metrics = this.paragraphs.get(paragraphId);
    if (!metrics) return;

    this.elements.set(paragraphId, element);
    this.intersectionObserver.observe(element, paragraphId, metrics);

    // Apply initial styles
    this.applyParagraphStyles(element, metrics);
  }

  /**
   * Unregister a paragraph element
   */
  unregisterParagraph(paragraphId: string): void {
    this.intersectionObserver.unobserve(paragraphId);
    this.elements.delete(paragraphId);
  }

  /**
   * Apply breathing styles to a paragraph
   */
  private applyParagraphStyles(element: HTMLElement, metrics: ParagraphMetrics): void {
    const { lineHeightMultiplier, letterSpacing } = metrics.metrics;

    element.style.lineHeight = lineHeightMultiplier.toString();
    element.style.letterSpacing = letterSpacing;

    // Add breathing class if enabled
    if (this.config.enabled) {
      element.classList.add('breathing-text');
    } else {
      element.classList.remove('breathing-text');
    }
  }

  /**
   * Start the breathing animation
   */
  start(): void {
    this.config.enabled = true;
    this.animationController.start();
    this.updateAllElements();
  }

  /**
   * Stop the breathing animation
   */
  stop(): void {
    this.config.enabled = false;
    this.animationController.stop();
    this.updateAllElements();
  }

  /**
   * Update all elements with current config
   */
  private updateAllElements(): void {
    this.elements.forEach((element, id) => {
      const metrics = this.paragraphs.get(id);
      if (metrics) {
        this.applyParagraphStyles(element, metrics);
      }
    });
  }

  /**
   * Update breathing configuration
   */
  updateConfig(config: Partial<BreathingConfig>): void {
    this.config = { ...this.config, ...config };
    this.animationController.updateConfig(this.config);
    this.updateAllElements();

    if (this.config.enabled && !this.animationController.getState().frame) {
      this.animationController.start();
    }
  }

  /**
   * Get current breathing state
   */
  getState(): BreathingState {
    return this.animationController.getState();
  }

  /**
   * Get current configuration
   */
  getConfig(): BreathingConfig {
    return { ...this.config };
  }

  /**
   * Get paragraph metrics
   */
  getParagraphMetrics(paragraphId: string): ParagraphMetrics | undefined {
    return this.paragraphs.get(paragraphId);
  }

  /**
   * Get all paragraph metrics
   */
  getAllParagraphMetrics(): ParagraphMetrics[] {
    return Array.from(this.paragraphs.values());
  }

  /**
   * Adjust breathing speed based on focus score
   */
  adjustSpeedBasedOnFocus(focusScore: number): void {
    const minSpeed = 0.1;
    const maxSpeed = 0.3;

    // Higher focus = faster breathing, lower focus = slower breathing
    const factor = focusScore / 100;
    const speed = minSpeed + (maxSpeed - minSpeed) * factor;

    this.updateConfig({ speed });
  }

  /**
   * Get visible paragraphs
   */
  getVisibleParagraphs(): string[] {
    return this.intersectionObserver.getVisibleParagraphs();
  }

  /**
   * Clean up
   */
  dispose(): void {
    this.animationController.stop();
    this.animationController.clearCallbacks();
    this.intersectionObserver.disconnect();
    this.paragraphs.clear();
    this.elements.clear();
  }
}

/**
 * Singleton instance
 */
let engineInstance: BreathingEngine | null = null;

export function getBreathingEngine(options?: BreathingEngineOptions): BreathingEngine {
  if (!engineInstance) {
    engineInstance = new BreathingEngine(options);
  }
  return engineInstance;
}

export function disposeBreathingEngine(): void {
  if (engineInstance) {
    engineInstance.dispose();
    engineInstance = null;
  }
}