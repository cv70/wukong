// AI Rewriter Types

export type RewriteMode = 'poetry';

export interface RewriteResult {
  /** The rewritten text */
  rewrittenText: string;
  /** Original text for comparison */
  originalText: string;
  /** Mode used */
  mode: RewriteMode;
  /** Confidence score (0-100) */
  confidence: number;
  /** Timestamp */
  timestamp: number;
  /** Whether from cache */
  fromCache: boolean;
}

export interface RewriteRequest {
  /** Text to rewrite */
  text: string;
  /** Rewrite mode */
  mode: RewriteMode;
  /** Whether to preserve length */
  preserveLength: boolean;
  /** Additional context */
  context?: string;
  /** Enable thinking/reasoning mode for supported models */
  enableThinking?: boolean;
}

export interface APIClientConfig {
  /** API provider */
  provider: 'openai' | 'anthropic';
  /** API key */
  apiKey: string;
  /** Model to use */
  model: string;
  /** Base URL (for custom endpoints) */
  baseURL?: string;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface PromptTemplate {
  mode: RewriteMode;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CacheEntry {
  /** Cache key */
  key: string;
  /** Rewrite result */
  result: RewriteResult;
  /** Timestamp */
  timestamp: number;
  /** TTL in milliseconds */
  ttl: number;
}

export interface RewriterState {
  /** Current mode */
  mode: RewriteMode;
  /** Whether showing original text */
  showOriginal: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Current result */
  currentResult: RewriteResult | null;
  /** History of rewrites */
  history: RewriteResult[];
}
