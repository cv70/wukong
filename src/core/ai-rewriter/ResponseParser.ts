// Response Parser for AI Rewriter

import type { RewriteResult, RewriteMode } from '../types/ai-rewriter';

/**
 * Parse the AI response
 */
export function parseResponse(
  responseText: string,
  originalText: string,
  mode: RewriteMode,
  confidence: number
): RewriteResult {
  // Clean up the response
  let cleanedText = responseText.trim();

  // Remove common AI response prefixes
  const prefixes = [
    '以下是改写后的文本：',
    '改写后的文本如下：',
    '改写后：',
    '以下是改写：',
  ];

  for (const prefix of prefixes) {
    if (cleanedText.startsWith(prefix)) {
      cleanedText = cleanedText.slice(prefix.length).trim();
      break;
    }
  }

  return {
    rewrittenText: cleanedText,
    originalText,
    mode,
    confidence,
    timestamp: Date.now(),
    fromCache: false,
  };
}

/**
 * Validate the rewrite result
 */
export function validateRewriteResult(result: RewriteResult): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for empty result
  if (!result.rewrittenText || result.rewrittenText.trim().length === 0) {
    issues.push('改写结果为空');
  }

  // Check for very short results
  if (result.rewrittenText.length < result.originalText.length * 0.3) {
    issues.push('改写结果过短');
  }

  // Check for identical text
  if (result.rewrittenText === result.originalText) {
    issues.push('改写结果与原文相同');
  }

  // Check for AI artifacts
  const artifacts = [
    '作为一个AI',
    '作为AI助手',
    '我无法',
    '我不能',
    '抱歉',
    '对不起',
  ];

  for (const artifact of artifacts) {
    if (result.rewrittenText.includes(artifact)) {
      issues.push(`检测到AI回复痕迹: "${artifact}"`);
      break;
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Calculate similarity between original and rewritten text
 */
export function calculateSimilarity(original: string, rewritten: string): number {
  // Simple word overlap similarity
  const originalWords = new Set(original.split(/\s+|(?=[\u4e00-\u9fa5])/).filter(w => w.length > 0));
  const rewrittenWords = new Set(rewritten.split(/\s+|(?=[\u4e00-\u9fa5])/).filter(w => w.length > 0));

  let intersection = 0;
  originalWords.forEach(word => {
    if (rewrittenWords.has(word)) {
      intersection++;
    }
  });

  const union = new Set([...originalWords, ...rewrittenWords]).size;
  return union > 0 ? intersection / union : 0;
}