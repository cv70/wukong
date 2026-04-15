import { useState, useEffect } from 'react';
import styles from './BreathingGuide.module.css';

interface BreathingGuideProps {
  onComplete: () => void;
  duration?: number; // in seconds, default 15
}

export function BreathingGuide({ onComplete, duration = 15 }: BreathingGuideProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'pause' | 'exhale'>('inhale');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration * 3));
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return newProgress;
      });
    }, duration * 1000 / 100);

    // Update breathing phase
    const phaseInterval = setInterval(() => {
      setPhase(prev => {
        if (prev === 'inhale') return 'pause';
        if (prev === 'pause') return 'exhale';
        return 'inhale';
      });
    }, 5000); // 5 seconds per phase

    return () => {
      clearInterval(interval);
      clearInterval(phaseInterval);
    };
  }, [duration, onComplete]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return '吸气';
      case 'pause': return '停顿';
      case 'exhale': return '呼气';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.circle} />
        <div className={styles.text}>{getPhaseText()}</div>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
        <button className={styles.skipButton} onClick={onComplete}>
          跳过引导
        </button>
      </div>
    </div>
  );
}