import styles from './ModeSelector.module.css';
import { getAvailableModes, type RewriteMode } from '../../core/ai-rewriter';

interface ModeSelectorProps {
  currentMode: RewriteMode;
  onModeChange: (mode: RewriteMode) => void;
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes = getAvailableModes();

  return (
    <div className={styles.selector}>
      {modes.map(mode => (
        <button
          key={mode.mode}
          className={`${styles.modeButton} ${currentMode === mode.mode ? styles.active : ''}`}
          onClick={() => onModeChange(mode.mode)}
          title={mode.description}
        >
          {mode.name}
        </button>
      ))}
    </div>
  );
}