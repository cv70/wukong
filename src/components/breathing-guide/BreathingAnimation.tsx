import styles from './BreathingAnimation.module.css';
import type { BreathingState } from '../../core/types/breathing';

interface BreathingAnimationProps {
  state: BreathingState;
}

export function BreathingAnimation({ state }: BreathingAnimationProps) {
  const phaseClass = `phase-${state.phase}`;

  return (
    <div className={`${styles.animation} ${styles[phaseClass]}`}>
      <div className={styles.circle}>
        <div className={styles.circleInner} />
      </div>
      <div className={styles.indicator}>
        {state.phase === 'inhale' && '吸气'}
        {state.phase === 'pause' && '停顿'}
        {state.phase === 'exhale' && '呼气'}
      </div>
    </div>
  );
}