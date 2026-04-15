import styles from './TrackingStatus.module.css';
import type { EyeTrackingState } from '../../core/types/eye-tracking';

interface TrackingStatusProps {
  state: EyeTrackingState;
}

export function TrackingStatus({ state }: TrackingStatusProps) {
  const getConfidenceClass = () => {
    if (state.focusScore >= 70) return styles.high;
    if (state.focusScore >= 40) return styles.medium;
    return styles.low;
  };

  return (
    <div className={styles.status}>
      <div className={styles.row}>
        <span className={styles.label}>专注度</span>
        <span className={styles.value}>{state.focusScore}%</span>
      </div>
      <div className={styles.barContainer}>
        <div
          className={`${styles.bar} ${getConfidenceClass()}`}
          style={{ width: `${state.focusScore}%` }}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>平均专注度</span>
        <span className={styles.value}>{state.averageFocusScore}%</span>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>眨眼次数</div>
          <div className={styles.metricValue}>{state.blinkCount}</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>状态</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {state.isTired ? '疲劳' : '正常'}
          </div>
        </div>
      </div>
    </div>
  );
}