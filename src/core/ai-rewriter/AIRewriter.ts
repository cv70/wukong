// AI Rewriter - Main Rewriter Logic

import { APIClient, createAPIClient } from './APIClient';
import { getAvailableModes } from './PromptTemplates';
import { parseResponse, validateRewriteResult } from './ResponseParser';
import { CacheManager, getCacheManager } from './CacheManager';
import type { APIClientConfig, RewriteResult, RewriteRequest } from '../types/ai-rewriter';

export interface AIRewriterOptions {
  config?: APIClientConfig;
  enableCache?: boolean;
  cacheTTL?: number;
}

/**
 * AI Rewriter - Main class for text rewriting
 */
export class AIRewriter {
  private client: APIClient | null = null;
  private cacheManager: CacheManager;
  private enableCache: boolean;
  private cacheTTL: number;

  constructor(options: AIRewriterOptions = {}) {
    this.cacheManager = getCacheManager();
    this.enableCache = options.enableCache ?? true;
    this.cacheTTL = options.cacheTTL ?? 24 * 60 * 60 * 1000; // 24 hours

    if (options.config) {
      this.configure(options.config);
    }
  }

  /**
   * Configure the API client
   */
  configure(config: APIClientConfig): void {
    this.client = createAPIClient(config);
  }

  /**
   * Check if the rewriter is ready
   */
  isReady(): boolean {
    return this.client?.isReady() ?? false;
  }

  /**
   * Rewrite text using the specified mode
   */
  async rewrite(request: RewriteRequest): Promise<RewriteResult> {
    if (!this.client) {
      throw new Error('API client not configured. Please set up your API key.');
    }

    // Check cache first
    if (this.enableCache) {
      const cached = this.cacheManager.get(request.text, request.mode);
      if (cached) {
        return cached;
      }
    }

    // Call API
    const { text: rewrittenText, confidence } = await this.client.rewriteText(
      request.text,
      request.mode,
      {
        preserveLength: request.preserveLength,
        context: request.context,
        enableThinking: request.enableThinking,
      }
    );

    // Parse response
    const result = parseResponse(rewrittenText, request.text, request.mode, confidence);

    // Validate result
    const validation = validateRewriteResult(result);
    if (!validation.valid) {
      console.warn('Rewrite validation issues:', validation.issues);
    }

    // Cache result
    if (this.enableCache && validation.valid) {
      this.cacheManager.set(request.text, request.mode, result, this.cacheTTL);
    }

    return result;
  }

  /**
   * Rewrite text with retry on failure
   */
  async rewriteWithRetry(
    request: RewriteRequest,
    maxRetries: number = 3
  ): Promise<RewriteResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.rewrite(request);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Rewrite attempt ${attempt + 1} failed:`, error);

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new Error('Rewrite failed after retries');
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    return this.client.testConnection();
  }

  /**
   * Get available rewrite modes
   */
  getAvailableModes() {
    return getAvailableModes();
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.cacheManager.clearAll();
  }
}

/**
 * Singleton instance
 */
let rewriterInstance: AIRewriter | null = null;

export function getAIRewriter(options?: AIRewriterOptions): AIRewriter {
  if (!rewriterInstance) {
    rewriterInstance = new AIRewriter(options);
  }
  return rewriterInstance;
}

export function disposeAIRewriter(): void {
  rewriterInstance = null;
}