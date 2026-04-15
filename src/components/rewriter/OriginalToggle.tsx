import styles from './OriginalToggle.module.css';

interface OriginalToggleProps {
  show: boolean;
  onToggle: (show: boolean) => void;
  hasResult: boolean;
}

export function OriginalToggle({ show, onToggle, hasResult }: OriginalToggleProps) {
  if (!hasResult) return null;

  return (
    <button
      className={`${styles.toggle} ${show ? styles.active : ''}`}
      onClick={() => onToggle(!show)}
      aria-label={show ? 'Show rewritten' : 'Show original'}
    >
      <span className={styles.icon}>📄</span>
      <span>{show ? '原文' : '重写'}</span>
    </button>
  );
}