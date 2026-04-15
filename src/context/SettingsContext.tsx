import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { secureStorage } from '../utils/storage';

interface Settings {
  breathing: {
    speed: number;
    amplitude: number;
    enabled: boolean;
  };
  eyeTracking: {
    enabled: boolean;
    showPreview: boolean;
    minConfidence: number;
  };
  reading: {
    fontSize: number;
    focusMode: boolean;
    theme: 'default' | 'calm' | 'warm' | 'cool';
  };
  api: {
    openaiKey: string;
    model: string;
    baseURL: string;
    enableThinking: boolean;
  };
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
}

const DEFAULT_SETTINGS: Settings = {
  breathing: {
    speed: 0.15,
    amplitude: 1.0,
    enabled: true,
  },
  eyeTracking: {
    enabled: false,
    showPreview: false,
    minConfidence: 0.7,
  },
  reading: {
    fontSize: 18,
    focusMode: false,
    theme: 'default',
  },
  api: {
    openaiKey: '',
    model: 'qwen3.5:4b',
    baseURL: '',
    enableThinking: true,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from storage
  useEffect(() => {
    const saved = secureStorage.get<Settings>('settings');
    if (saved) {
      setSettings(saved);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    secureStorage.set('settings', settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev };

      // Deep merge nested objects
      Object.keys(updates).forEach(key => {
        const k = key as keyof Settings;
        const updateValue = updates[k];
        const prevValue = prev[k];

        if (updateValue && prevValue && typeof updateValue === 'object' && typeof prevValue === 'object') {
          newSettings[k] = { ...prevValue, ...updateValue } as any;
        } else if (updateValue !== undefined) {
          newSettings[k] = updateValue as any;
        }
      });

      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      updateSettings(parsed);
      return true;
    } catch {
      return false;
    }
  }, [updateSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}