// AI Rewrite Prompt Templates

export const PROMPT_TEMPLATES: Record<string, {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
}> = {
  poetry: {
    systemPrompt: `你是一位擅长诗歌创作的诗人。你能够将任何文本内容转化为富有诗意和韵律的诗歌。你注重节奏感、意象表达和情感共鸣，让文字如音乐般流淌。`,
    userPrompt: `请将以下文本改写成诗歌。注重韵律和节奏，运用诗意的意象和表达方式，让文字充满美感。

原文：
{text}

要求：
1. 将内容转化为诗歌格式，分行表达
2. 注重韵律和节奏感
3. 运用诗意的意象和比喻
4. 保持原文的核心信息和情感
5. 每行控制在10-15字之间，便于动态展示`,
    maxTokens: 12800,
    temperature: 0.75,
  },
};

// Model configurations for different providers
export const MODEL_CONFIG = {
  openai: {
    'gpt-4o': { maxTokens: 12800, temperature: 0.7 },
    'gpt-4o-mini': { maxTokens: 12800, temperature: 0.7 },
    'gpt-4-turbo': { maxTokens: 12800, temperature: 0.7 },
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': { maxTokens: 12800, temperature: 0.7 },
    'claude-3-haiku-20240307': { maxTokens: 12800, temperature: 0.7 },
  },
} as const;

// Cache TTL settings (in milliseconds)
export const CACHE_TTL = {
  DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  SHORT: 1 * 60 * 60 * 1000,    // 1 hour
  LONG: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
