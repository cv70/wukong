import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  getEyeTrackingManager,
  type EyeTrackingState,
  type EyeTrackingConfig,
  type IrisData,
} from '../core/eye-tracking';

interface EyeTrackingContextType {
  state: EyeTrackingState;
  config: EyeTrackingConfig;
  isInitialized: boolean;
  isActive: boolean;
  initialize: () => Promise<boolean>;
  start: (videoElement: HTMLVideoElement) => Promise<boolean>;
  stop: () => Promise<void>;
  updateConfig: (config: Partial<EyeTrackingConfig>) => void;
  onIrisData?: (callback: (irisData: IrisData) => void) => () => void;
}

const EyeTrackingContext = createContext<EyeTrackingContextType | undefined>(undefined);

interface EyeTrackingProviderProps {
  children: ReactNode;
}

export function EyeTrackingProvider({ children }: EyeTrackingProviderProps) {
  const [state, setState] = useState<EyeTrackingState>({
    isActive: false,
    isInitialized: false,
    focusScore: 50,
    averageFocusScore: 50,
    lastBlink: 0,
    blinkCount: 0,
    isTired: false,
    error: null,
  });
  const [config, setConfig] = useState<EyeTrackingConfig>({
    enabled: false,
    facingMode: 'user',
    minConfidence: 0.7,
    smoothingFactor: 0.3,
    showPreview: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const managerRef = useRef(getEyeTrackingManager());

  const initialize = useCallback(async (): Promise<boolean> => {
    const success = await managerRef.current.initialize();
    setIsInitialized(success);

    if (success) {
      managerRef.current.addStateCallback(newState => setState(newState));
    }

    return success;
  }, []);

  const start = useCallback(async (videoElement: HTMLVideoElement): Promise<boolean> => {
    const success = await managerRef.current.start(videoElement);
    setIsActive(success);
    return success;
  }, []);

  const stop = useCallback(async (): Promise<void> => {
    await managerRef.current.stop();
    setIsActive(false);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<EyeTrackingConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    managerRef.current.updateConfig(newConfig);
  }, []);

  const onIrisData = useCallback((callback: (irisData: IrisData) => void) => {
    managerRef.current.addIrisDataCallback(callback);
    return () => {
      managerRef.current.removeIrisDataCallback(callback);
    };
  }, []);

  return (
    <EyeTrackingContext.Provider
      value={{
        state,
        config,
        isInitialized,
        isActive,
        initialize,
        start,
        stop,
        updateConfig,
        onIrisData,
      }}
    >
      {children}
    </EyeTrackingContext.Provider>
  );
}

export function useEyeTracking(): EyeTrackingContextType {
  const context = useContext(EyeTrackingContext);
  if (!context) {
    throw new Error('useEyeTracking must be used within EyeTrackingProvider');
  }
  return context;
}