export { parseSentences, parseParagraphs, getWordCount, getCharacterCount, getAverageSentenceLength } from './sentenceParser';
export type { ParsedSentence, ParsedParagraph } from './sentenceParser';
export { calculateSentenceComplexity, calculateParagraphComplexity, getLineHeight, getLetterSpacing, calculateTextMetrics, analyzeSentences } from './complexityAnalyzer';
export type { TextMetrics } from './complexityAnalyzer';
export { detectEmphasisWords, stripEmphasisMarkers, getEmphasisClass } from './emphasisDetector';
export type { EmphasisWord } from './emphasisDetector';