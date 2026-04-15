// API Client - OpenAI Integration

import OpenAI from 'openai';
import type { APIClientConfig, RewriteMode } from '../types/ai-rewriter';
import { PROMPT_TEMPLATES } from '../../constants';

/**
 * API Client for AI rewriting
 */
export class APIClient {
  private client: OpenAI | null = null;
  private config: APIClientConfig;

  constructor(config: APIClientConfig) {
    this.config = config;
    this.initClient();
  }

  /**
   * Initialize the OpenAI client
   */
  private initClient(): void {
    if (this.config.provider === 'openai') {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
        timeout: this.config.timeout || 600000,
        dangerouslyAllowBrowser: true, // Allow browser usage
      });
    }
  }

  /**
   * Update the API configuration
   */
  updateConfig(config: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...config };
    this.initClient();
  }

  /**
   * Rewrite text using the specified mode
   */
  async rewriteText(
    text: string,
    mode: RewriteMode,
    options: { preserveLength?: boolean; context?: string; enableThinking?: boolean } = {}
  ): Promise<{ text: string; confidence: number }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const template = PROMPT_TEMPLATES[mode];
    if (!template) {
      throw new Error(`Unknown rewrite mode: ${mode}`);
    }

    // Build the prompt
    let userPrompt = template.userPrompt.replace('{text}', text);

    if (options.preserveLength) {
      userPrompt += '\n\n注意：请保持与原文相似的长度。';
    }

    if (options.context) {
      userPrompt += `\n\n补充上下文：${options.context}`;
    }

    try {
      // Build request parameters
      const requestParams: any = {
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: template.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: template.maxTokens,
        temperature: template.temperature,
      };

      // Handle thinking/reasoning mode for supported models
      // By default, models think. When explicitly disabled, we pass parameters to disable.
      const modelSupportsThinking = this.modelSupportsThinking(this.config.model || '');
      if (modelSupportsThinking && options.enableThinking === false) {
        // Disable thinking for models that support it
        requestParams.reasoning_effort = 'none'; // Disable reasoning entirely
        requestParams.think = false; // Explicitly disable thinking mode
      }

      const response = await this.client.chat.completions.create(requestParams);

      const rewrittenText = response.choices[0]?.message?.content || '';
      const confidence = this.calculateConfidence(response, text, rewrittenText);

      return { text: rewrittenText, confidence };
    } catch (error) {
      console.error('AI rewrite error:', error);
      throw error;
    }
  }

  /**
   * Check if model supports thinking/reasoning
   */
  private modelSupportsThinking(model: string): boolean {
    const thinkingModels = [
      'o1', 'o1-mini', 'o1-preview', 'o1-pro',
      'o3', 'o3-mini', 'o3-pro',
      'claude-3-7-sonnet', 'claude-3.7-sonnet',
      'qwen', 'deepseek', 'deepseek-r1',
    ];
    return thinkingModels.some(m => model.toLowerCase().includes(m.toLowerCase()));
  }

  /**
   * Calculate confidence score based on response quality
   */
  private calculateConfidence(
    response: any,
    originalText: string,
    rewrittenText: string
  ): number {
    let confidence = 80; // Base confidence

    // Check if response is empty
    if (!rewrittenText || rewrittenText.trim().length === 0) {
      return 0;
    }

    // Check length similarity (±30%)
    const lengthRatio = rewrittenText.length / originalText.length;
    if (lengthRatio >= 0.7 && lengthRatio <= 1.3) {
      confidence += 10;
    } else {
      confidence -= 10;
    }

    // Check for valid completion
    const finishReason = response.choices[0]?.finish_reason;
    if (finishReason === 'stop') {
      confidence += 10;
    } else {
      confidence -= 20;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) return false;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "ok" if you can read this.' }],
        max_tokens: 10,
      });
      return !!response.choices[0]?.message?.content;
    } catch {
      return false;
    }
  }

  /**
   * Check if the client is initialized
   */
  isReady(): boolean {
    return this.client !== null;
  }
}

/**
 * Create an API client
 */
export function createAPIClient(config: APIClientConfig): APIClient {
  return new APIClient(config);
}