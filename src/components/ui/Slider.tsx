import styles from './UI.module.css';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

export function Slider({ value, min, max, onChange, label }: SliderProps) {
  return (
    <div className={styles.sliderContainer}>
      {label && (
        <div className={styles.sliderLabel}>
          <span>{label}</span>
          <span>{value.toFixed(2)}</span>
        </div>
      )}
      <input
        type="range"
        className={styles.slider}
        value={value}
        min={min}
        max={max}
        step="0.01"
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}