import styles from './FocusModeToggle.module.css';
import { useFocusMode } from '../../hooks';

export function FocusModeToggle() {
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  return (
    <button
      className={`${styles.toggle} ${isFocusMode ? styles.active : ''}`}
      onClick={toggleFocusMode}
      aria-label={isFocusMode ? 'Disable focus mode' : 'Enable focus mode'}
    >
      <span className={styles.icon}>🎯</span>
      <span className={styles.label}>
        {isFocusMode ? 'Focus Mode On' : 'Focus Mode'}
      </span>
    </button>
  );
}