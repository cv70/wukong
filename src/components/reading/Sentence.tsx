import styles from './Sentence.module.css';

interface SentenceProps {
  text: string;
  isFirst?: boolean;
}

export function Sentence({ text, isFirst }: SentenceProps) {
  return (
    <span className={`${styles.sentence} ${isFirst ? styles.isFirst : ''}`}>
      <span className={styles.text}>{text}</span>
    </span>
  );
}