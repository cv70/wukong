// Emphasis Detector - Detect emphasized words and phrases

export interface EmphasisWord {
  text: string;
  type: 'bold' | 'italic' | 'highlight' | 'strong' | 'key';
  startIndex: number;
  endIndex: number;
}

/**
 * Detect emphasized words in text
 */
export function detectEmphasisWords(text: string): EmphasisWord[] {
  const emphasisWords: EmphasisWord[] = [];

  // Bold text: **text** or __text__
  const boldRegex = /\*\*(.+?)\*\*|__(.+?)__/g;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    const matchedText = match[1] || match[2];
    emphasisWords.push({
      text: matchedText,
      type: 'bold',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Italic text: *text* or _text_
  const italicRegex = /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g;
  while ((match = italicRegex.exec(text)) !== null) {
    const matchedText = match[1] || match[2];
    emphasisWords.push({
      text: matchedText,
      type: 'italic',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Highlight text: ==text==
  const highlightRegex = /==(.+?)==/g;
  while ((match = highlightRegex.exec(text)) !== null) {
    emphasisWords.push({
      text: match[1],
      type: 'highlight',
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  // Key phrases: 重要概念、专业术语等
  const keyPhrases = detectKeyPhrases(text);
  emphasisWords.push(...keyPhrases);

  return emphasisWords;
}

/**
 * Detect key phrases (important concepts, technical terms)
 */
function detectKeyPhrases(text: string): EmphasisWord[] {
  const keyPhrases: EmphasisWord[] = [];

  // Chinese key phrase patterns
  const keyPatterns = [
    /【.+?】/g,           // 【概念】
    /「.+?」/g,          // 「引用」
    /《.+?》/g,          // 《书名》
    /\[.+?\]/g,          // [术语]
  ];

  keyPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      keyPhrases.push({
        text: match[0].slice(1, -1),
        type: 'key',
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  });

  return keyPhrases;
}

/**
 * Remove emphasis markers from text for display
 */
export function stripEmphasisMarkers(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **text** -> text
    .replace(/__(.+?)__/g, '$1')       // __text__ -> text
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')  // *text* -> text
    .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '$1')        // _text_ -> text
    .replace(/==(.+?)==/g, '$1');      // ==text== -> text
}

/**
 * Get CSS class for emphasis type
 */
export function getEmphasisClass(type: EmphasisWord['type']): string {
  const classMap: Record<EmphasisWord['type'], string> = {
    bold: 'emphasis-bold',
    italic: 'emphasis-italic',
    highlight: 'emphasis-highlight',
    strong: 'emphasis-strong',
    key: 'emphasis-key',
  };
  return classMap[type];
}