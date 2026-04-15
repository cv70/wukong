// Complexity Analyzer - Text Complexity Scoring

import { parseSentences, getWordCount, getCharacterCount } from './sentenceParser';
import type { ParsedSentence } from './sentenceParser';
import { COMPLEXITY_THRESHOLDS, LINE_HEIGHT_MAP, LETTER_SPACING_MAP } from '../../constants';

/**
 * Calculate the complexity score for a sentence (0-100)
 */
export function calculateSentenceComplexity(sentence: string): number {
  let score = 0;

  // Word count factor (longer sentences are more complex)
  const wordCount = getWordCount(sentence);
  if (wordCount > 30) score += 20;
  else if (wordCount > 20) score += 15;
  else if (wordCount > 15) score += 10;
  else score += 5;

  // Sentence structure complexity
  // Commas indicate complex sentence structure
  const commaCount = (sentence.match(/[,，、;；]/g) || []).length;
  score += Math.min(commaCount * 5, 15);

  // Parentheses and quotes indicate nested structure
  const nestedPunctuation = (sentence.match(/[()（）""''「」【】]/g) || []).length;
  score += Math.min(nestedPunctuation * 3, 10);

  // Technical terms and jargon (uppercase words, numbers, symbols)
  const technicalPatterns = (sentence.match(/[A-Z]{2,}|\d+%?|\$|€|¥|£|°|%|≈|≤|≥|≠|×|÷/g) || []).length;
  score += Math.min(technicalPatterns * 3, 15);

  // Long words (more than 6 characters in English, or complex Chinese phrases)
  const longWords = sentence.split(/\s+/).filter(word => word.length > 8).length;
  score += Math.min(longWords * 3, 10);

  // Chinese specific: idioms (4-character phrases) and classical patterns
  const chineseIdioms = (sentence.match(/[\u4e00-\u9fa5]{4}/g) || []).length;
  score += Math.min(chineseIdioms * 2, 10);

  // Abstract concepts indicators
  const abstractWords = (sentence.match(/性|化|主义|理论|概念|本质|规律|逻辑|关系|体系|机制/g) || []).length;
  score += Math.min(abstractWords * 3, 15);

  // Negation and conditional logic
  const logicWords = (sentence.match(/不|非|无|未|除非|如果|假设|即使|尽管|然而|但是/g) || []).length;
  score += Math.min(logicWords * 2, 10);

  // Mathematical or scientific notation
  const hasMathNotation = /[=+\-*/^_∑∏∫√∞]/.test(sentence);
  if (hasMathNotation) score += 10;

  return Math.min(score, 100);
}

/**
 * Calculate the complexity score for a paragraph
 */
export function calculateParagraphComplexity(text: string): number {
  const sentences = parseSentences(text);
  if (sentences.length === 0) return 0;

  const scores = sentences.map(s => calculateSentenceComplexity(s.text));
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Get line height multiplier based on complexity
 */
export function getLineHeight(complexityScore: number): number {
  if (complexityScore < COMPLEXITY_THRESHOLDS.LOW) {
    return LINE_HEIGHT_MAP.LOW;
  } else if (complexityScore < COMPLEXITY_THRESHOLDS.MEDIUM) {
    return LINE_HEIGHT_MAP.MEDIUM;
  } else {
    return LINE_HEIGHT_MAP.HIGH;
  }
}

/**
 * Get letter spacing based on complexity
 */
export function getLetterSpacing(complexityScore: number): string {
  if (complexityScore < COMPLEXITY_THRESHOLDS.LOW) {
    return `${LETTER_SPACING_MAP.LOW}em`;
  } else if (complexityScore < COMPLEXITY_THRESHOLDS.MEDIUM) {
    return `${LETTER_SPACING_MAP.MEDIUM}em`;
  } else {
    return `${LETTER_SPACING_MAP.HIGH}em`;
  }
}

/**
 * Calculate overall text metrics
 */
export interface TextMetrics {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  complexityScore: number;
  lineHeightMultiplier: number;
  letterSpacing: string;
}

export function calculateTextMetrics(text: string): TextMetrics {
  const sentences = parseSentences(text);
  const wordCount = getWordCount(text);
  const sentenceCount = sentences.length;
  const complexityScore = calculateParagraphComplexity(text);

  return {
    characterCount: getCharacterCount(text),
    wordCount,
    sentenceCount,
    avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
    complexityScore,
    lineHeightMultiplier: getLineHeight(complexityScore),
    letterSpacing: getLetterSpacing(complexityScore),
  };
}

/**
 * Analyze sentence complexity for breathing rhythm
 */
export function analyzeSentences(sentences: ParsedSentence[]): Array<{
  sentence: ParsedSentence;
  complexity: number;
  breathingPause: number; // suggested pause in ms
}> {
  return sentences.map(sentence => {
    const complexity = calculateSentenceComplexity(sentence.text);

    // More complex sentences get longer pauses for comprehension
    const breathingPause = 500 + (complexity / 100) * 1500; // 500-2000ms

    return {
      sentence,
      complexity,
      breathingPause,
    };
  });
}