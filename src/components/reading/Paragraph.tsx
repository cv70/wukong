import { calculateParagraphComplexity as calculateComplexity, getLineHeight, getLetterSpacing } from '../../utils/text';
import styles from './Paragraph.module.css';
import { Sentence } from './Sentence';

interface ParagraphProps {
  text: string;
  index: number;
}

export function Paragraph({ text, index }: ParagraphProps) {
  const complexity = calculateComplexity(text);

  const getComplexityClass = () => {
    if (complexity < 40) return styles.simple;
    if (complexity < 70) return styles.moderate;
    return styles.complex;
  };

  const sentences = text.split(/([.!?。！？]+)/).filter(s => s.trim().length > 0);

  return (
    <p
      className={`${styles.paragraph} ${getComplexityClass()}`}
      style={{
        lineHeight: getLineHeight(complexity).toString(),
        letterSpacing: getLetterSpacing(complexity),
      }}
      data-paragraph-id={`para-${index}`}
    >
      {sentences.map((sentence, sentenceIndex) => (
        <Sentence
          key={`para-${index}-sent-${sentenceIndex}`}
          text={sentence}
          isFirst={sentenceIndex === 0}
        />
      ))}
    </p>
  );
}