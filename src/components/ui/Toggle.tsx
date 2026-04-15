import styles from './UI.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <div className={styles.toggleContainer}>
      <div
        className={`${styles.toggle} ${checked ? styles.active : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
      >
        <div className={styles.toggleThumb} />
      </div>
      {label && <span>{label}</span>}
    </div>
  );
}