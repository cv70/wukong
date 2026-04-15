// Prompt Templates for AI Rewriter

import type { RewriteMode, PromptTemplate } from '../types/ai-rewriter';

/**
 * Get prompt template for a rewrite mode
 */
export function getPromptTemplate(mode: RewriteMode): PromptTemplate {
  const templates: Record<RewriteMode, PromptTemplate> = {
    poetry: {
      mode: 'poetry',
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
      maxTokens: 1000,
      temperature: 0.75,
    },
  };

  return templates[mode];
}

/**
 * Get all available modes
 */
export function getAvailableModes(): Array<{
  mode: RewriteMode;
  name: string;
  description: string;
}> {
  return [
    {
      mode: 'poetry',
      name: '诗歌创作',
      description: '将文案转化为富有韵律和美感的诗歌',
    },
  ];
}