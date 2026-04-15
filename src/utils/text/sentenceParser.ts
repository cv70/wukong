// Sentence Parser - Text Analysis Utilities

export interface ParsedSentence {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedParagraph {
  id: string;
  text: string;
  sentences: ParsedSentence[];
}

/**
 * Generate a unique ID for sentences and paragraphs
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse text into sentences using regex and heuristics
 */
export function parseSentences(text: string): ParsedSentence[] {
  const sentences: ParsedSentence[] = [];

  // Regex pattern for sentence boundaries
  // Matches: period, exclamation, question mark followed by space or end
  const sentenceRegex = /[^.!?。！？]*[.!?。！？]+(?=\s|$)/g;

  let match;
  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentenceText = match[0].trim();
    if (sentenceText.length > 0) {
      sentences.push({
        id: generateId('sentence'),
        text: sentenceText,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  // Handle remaining text that doesn't end with punctuation
  const lastMatchEnd = sentences.length > 0
    ? sentences[sentences.length - 1].endIndex
    : 0;

  const remaining = text.slice(lastMatchEnd).trim();
  if (remaining.length > 0) {
    sentences.push({
      id: generateId('sentence'),
      text: remaining,
      startIndex: lastMatchEnd,
      endIndex: text.length,
    });
  }

  return sentences;
}

/**
 * Parse text into paragraphs
 */
export function parseParagraphs(text: string): ParsedParagraph[] {
  const paragraphs: ParsedParagraph[] = [];

  // Split by double newlines or single newlines
  const paragraphTexts = text.split(/\n\s*\n|\n/).filter(p => p.trim().length > 0);

  paragraphTexts.forEach(paragraphText => {
    const trimmed = paragraphText.trim();
    if (trimmed.length > 0) {
      paragraphs.push({
        id: generateId('paragraph'),
        text: trimmed,
        sentences: parseSentences(trimmed),
      });
    }
  });

  return paragraphs;
}

/**
 * Get word count from text (handles both English and Chinese)
 */
export function getWordCount(text: string): number {
  // Chinese characters
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

  // English words
  const englishWords = text
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  return chineseChars + englishWords;
}

/**
 * Get character count
 */
export function getCharacterCount(text: string): number {
  return text.replace(/\s/g, '').length;
}

/**
 * Calculate average sentence length
 */
export function getAverageSentenceLength(sentences: ParsedSentence[]): number {
  if (sentences.length === 0) return 0;

  const totalWords = sentences.reduce(
    (sum, s) => sum + getWordCount(s.text),
    0
  );

  return totalWords / sentences.length;
}