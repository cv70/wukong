// Intersection Observer for Performance Optimization

import type { ParagraphMetrics } from '../types/breathing';

export interface VisibilityCallback {
  (paragraphId: string, isVisible: boolean): void;
}

/**
 * Intersection Observer Manager - Handles visibility detection for performance
 */
export class IntersectionObserverManager {
  private observer: IntersectionObserver | null = null;
  private callbacks: Map<string, Set<VisibilityCallback>> = new Map();
  private observedElements: Map<string, HTMLElement> = new Map();
  private paragraphMetrics: Map<string, ParagraphMetrics> = new Map();

  constructor() {
    this.init();
  }

  /**
   * Initialize the intersection observer
   */
  private init(): void {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const id = element.dataset.paragraphId;
          if (id) {
            this.updateVisibility(id, entry.isIntersecting);
            const metrics = this.paragraphMetrics.get(id);
            if (metrics) {
              metrics.isVisible = entry.isIntersecting;
              this.paragraphMetrics.set(id, metrics);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '200px 0px 200px 0px', // Load paragraphs before they enter viewport
        threshold: 0,
      }
    );
  }

  /**
   * Observe a paragraph element
   */
  observe(element: HTMLElement, paragraphId: string, metrics: ParagraphMetrics): void {
    if (!this.observer) return;

    element.dataset.paragraphId = paragraphId;
    this.observer.observe(element);
    this.observedElements.set(paragraphId, element);
    this.paragraphMetrics.set(paragraphId, metrics);

    // Initialize as invisible until observed
    if (metrics) {
      metrics.isVisible = false;
    }
  }

  /**
   * Stop observing a paragraph element
   */
  unobserve(paragraphId: string): void {
    if (!this.observer) return;

    const element = this.observedElements.get(paragraphId);
    if (element) {
      this.observer.unobserve(element);
      this.observedElements.delete(paragraphId);
    }

    this.callbacks.delete(paragraphId);
    this.paragraphMetrics.delete(paragraphId);
  }

  /**
   * Add a callback for visibility changes
   */
  addCallback(paragraphId: string, callback: VisibilityCallback): void {
    if (!this.callbacks.has(paragraphId)) {
      this.callbacks.set(paragraphId, new Set());
    }
    this.callbacks.get(paragraphId)!.add(callback);
  }

  /**
   * Remove a callback
   */
  removeCallback(paragraphId: string, callback: VisibilityCallback): void {
    const callbacks = this.callbacks.get(paragraphId);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.callbacks.delete(paragraphId);
      }
    }
  }

  /**
   * Update visibility for a paragraph
   */
  private updateVisibility(paragraphId: string, isVisible: boolean): void {
    const callbacks = this.callbacks.get(paragraphId);
    if (callbacks) {
      callbacks.forEach(cb => cb(paragraphId, isVisible));
    }
  }

  /**
   * Get all visible paragraphs
   */
  getVisibleParagraphs(): string[] {
    const visible: string[] = [];
    this.paragraphMetrics.forEach((metrics, id) => {
      if (metrics.isVisible) {
        visible.push(id);
      }
    });
    return visible;
  }

  /**
   * Check if a paragraph is visible
   */
  isVisible(paragraphId: string): boolean {
    const metrics = this.paragraphMetrics.get(paragraphId);
    return metrics?.isVisible ?? false;
  }

  /**
   * Disconnect and clean up
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callbacks.clear();
    this.observedElements.clear();
    this.paragraphMetrics.clear();
  }
}

/**
 * Singleton instance
 */
let observerInstance: IntersectionObserverManager | null = null;

export function getIntersectionObserver(): IntersectionObserverManager {
  if (!observerInstance) {
    observerInstance = new IntersectionObserverManager();
  }
  return observerInstance;
}