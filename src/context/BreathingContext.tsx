import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getBreathingEngine, type BreathingConfig, type BreathingState } from '../core/breathing-engine';

interface BreathingContextType {
  config: BreathingConfig;
  state: BreathingState;
  isRunning: boolean;
  updateConfig: (config: Partial<BreathingConfig>) => void;
  start: () => void;
  stop: () => void;
}

const BreathingContext = createContext<BreathingContextType | undefined>(undefined);

interface BreathingProviderProps {
  children: ReactNode;
}

export function BreathingProvider({ children }: BreathingProviderProps) {
  const [config, setConfig] = useState<BreathingConfig>({
    speed: 0.15,
    amplitude: 1.0,
    enabled: true,
  });
  const [state, setState] = useState<BreathingState>({
    phase: 'inhale',
    progress: 0,
    frame: 0,
    lastTimestamp: 0,
  });
  const [isRunning, setIsRunning] = useState(false);

  const updateConfig = useCallback((newConfig: Partial<BreathingConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    const engine = getBreathingEngine();
    engine.updateConfig(newConfig);
  }, []);

  const start = useCallback(() => {
    const engine = getBreathingEngine();
    engine.start();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    const engine = getBreathingEngine();
    engine.stop();
    setIsRunning(false);
  }, []);

  useEffect(() => {
    const engine = getBreathingEngine({
      config,
      onPhaseChange: (phase, progress) => {
        setState(prev => ({ ...prev, phase, progress }));
      },
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <BreathingContext.Provider value={{ config, state, isRunning, updateConfig, start, stop }}>
      {children}
    </BreathingContext.Provider>
  );
}

export function useBreathing(): BreathingContextType {
  const context = useContext(BreathingContext);
  if (!context) {
    throw new Error('useBreathing must be used within BreathingProvider');
  }
  return context;
}