// Text Analyzer for Breathing Engine

import { calculateTextMetrics } from '../../utils/text';
import type { ParagraphMetrics, SentenceMetrics } from '../types/breathing';

/**
 * Text Analyzer - Analyzes text for breathing typography
 */
export class TextAnalyzer {
  /**
   * Analyze a paragraph and return its metrics
   */
  analyzeParagraph(text: string, index: number): ParagraphMetrics {
    const id = `paragraph_${index}_${Date.now()}`;
    const metrics = calculateTextMetrics(text);

    // Split into sentences for fine-grained control
    const sentences = this.analyzeSentences(text, id);

    return {
      id,
      text,
      sentences,
      metrics,
      isVisible: false,
    };
  }

  /**
   * Analyze sentences within a paragraph
   */
  private analyzeSentences(text: string, paragraphId: string): SentenceMetrics[] {
    // Simple sentence splitting
    const sentenceRegex = /[^.!?。！？]*[.!?。！？]+/g;
    const sentences: SentenceMetrics[] = [];

    let match;
    let startIndex = 0;
    let sentenceIndex = 0;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentenceText = match[0].trim();
      if (sentenceText.length > 0) {
        sentences.push({
          id: `${paragraphId}_sentence_${sentenceIndex}`,
          text: sentenceText,
          startIndex,
          endIndex: startIndex + sentenceText.length,
          complexityScore: this.calculateComplexity(sentenceText),
          emphasisWords: this.detectEmphasis(sentenceText),
        });
        startIndex += match[0].length;
        sentenceIndex++;
      }
    }

    // Handle remaining text
    const remaining = text.slice(startIndex).trim();
    if (remaining.length > 0) {
      sentences.push({
        id: `${paragraphId}_sentence_${sentenceIndex}`,
        text: remaining,
        startIndex,
        endIndex: text.length,
        complexityScore: this.calculateComplexity(remaining),
        emphasisWords: this.detectEmphasis(remaining),
      });
    }

    return sentences;
  }

  /**
   * Calculate complexity score for a sentence
   */
  private calculateComplexity(sentence: string): number {
    let score = 0;

    // Word count
    const wordCount = sentence.split(/\s+/).length;
    score += Math.min(wordCount * 2, 30);

    // Punctuation complexity
    const punctuationCount = (sentence.match(/[,，、;；:：]/g) || []).length;
    score += Math.min(punctuationCount * 5, 20);

    // Nested structures
    const nestedCount = (sentence.match(/[()（）""''「」【】]/g) || []).length;
    score += Math.min(nestedCount * 3, 15);

    // Abstract words
    const abstractWords = (sentence.match(/性|化|主义|理论|概念|本质|规律/g) || []).length;
    score += Math.min(abstractWords * 5, 20);

    // Logic words
    const logicWords = (sentence.match(/不|非|无|未|如果|假设|即使|尽管|然而|但是/g) || []).length;
    score += Math.min(logicWords * 2, 15);

    return Math.min(score, 100);
  }

  /**
   * Detect emphasis words in a sentence
   */
  private detectEmphasis(sentence: string): string[] {
    const emphasisWords: string[] = [];

    // Bold/italic markers (would be stripped later)
    const boldMatches = sentence.match(/\*\*(.+?)\*\*/g) || [];
    emphasisWords.push(...boldMatches.map(m => m.replace(/\*\*/g, '')));

    // Key phrase indicators
    const keyMatches = sentence.match(/【.+?】|「.+?」|《.+?》|\[.+?\]/g) || [];
    emphasisWords.push(...keyMatches);

    return emphasisWords;
  }

  /**
   * Calculate breathing rhythm based on paragraph complexity
   */
  calculateBreathingRhythm(paragraph: ParagraphMetrics): {
    inhaleDuration: number;
    pauseDuration: number;
    exhaleDuration: number;
  } {
    const complexity = paragraph.metrics.complexityScore;

    // More complex text gets slower breathing for better comprehension
    const factor = 1 + (complexity / 100) * 0.5;

    return {
      inhaleDuration: 4000 * factor,
      pauseDuration: 1000 * factor,
      exhaleDuration: 4000 * factor,
    };
  }
}