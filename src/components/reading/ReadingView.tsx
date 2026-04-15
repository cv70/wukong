import { useRef, type ReactNode } from 'react';
import styles from './ReadingView.module.css';
import { useFocusMode } from '../../hooks';
import { Paragraph } from './Paragraph';

interface ReadingViewProps {
  text: string;
  children?: ReactNode;
}

export function ReadingView({ text, children }: ReadingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFocusMode } = useFocusMode();

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  return (
    <div
      ref={containerRef}
      className={`${styles.readingView} ${isFocusMode ? styles.focusMode : ''}`}
    >
      {paragraphs.map((paragraphText, index) => (
        <Paragraph key={`para-${index}`} text={paragraphText} index={index} />
      ))}
      {children}
    </div>
  );
}