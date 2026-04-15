import styles from './ConfidenceIndicator.module.css';

interface ConfidenceIndicatorProps {
  confidence: number;
}

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const getConfidenceClass = () => {
    if (confidence >= 80) return styles.high;
    if (confidence >= 50) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.indicator}>
      <span className={styles.label}>置信度</span>
      <div className={styles.bar}>
        <div
          className={`${styles.barFill} ${getConfidenceClass()}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <span className={styles.value}>{confidence}%</span>
    </div>
  );
}