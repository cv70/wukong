import { useState, useCallback, useEffect, useRef } from 'react';
import { useBreathing as useBreathingContext } from '../context/BreathingContext';
import { useEyeTracking as useEyeTrackingContext } from '../context/EyeTrackingContext';
import { useRewriter as useRewriterContext } from '../context/RewriterContext';
import { useSettings } from '../context/SettingsContext';

// Breathing Engine Hook
export function useBreathing() {
  const context = useBreathingContext();
  const { settings } = useSettings();

  // Sync with settings
  useEffect(() => {
    context.updateConfig({
      speed: settings.breathing.speed,
      amplitude: settings.breathing.amplitude,
      enabled: settings.breathing.enabled,
    });
  }, [settings.breathing, context.updateConfig]);

  return context;
}

// Eye Tracking Hook
export function useEyeTracking() {
  const context = useEyeTrackingContext();
  const { settings } = useSettings();

  // Sync with settings
  useEffect(() => {
    context.updateConfig(settings.eyeTracking);
  }, [settings.eyeTracking, context.updateConfig]);

  return context;
}

// Rewriter Hook
export function useRewriter() {
  const context = useRewriterContext();
  return context;
}

// Focus Mode Hook
export function useFocusMode() {
  const { settings, updateSettings } = useSettings();

  const toggleFocusMode = useCallback(() => {
    updateSettings({
      reading: {
        ...settings.reading,
        focusMode: !settings.reading.focusMode,
      },
    });
  }, [settings.reading, updateSettings]);

  return {
    isFocusMode: settings.reading.focusMode,
    toggleFocusMode,
  };
}

// Text Analysis Hook
export function useTextAnalysis() {
  const analyze = useCallback((text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return paragraphs.map((para, index) => {
      const sentences = para.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
      const wordCount = para.split(/\s+/).length;
      const characterCount = para.replace(/\s/g, '').length;

      // Calculate complexity
      const complexityScore = calculateComplexity(para);

      return {
        id: `para_${index}`,
        text: para,
        sentences,
        wordCount,
        characterCount,
        complexityScore,
      };
    });
  }, []);

  return { analyze };
}

function calculateComplexity(text: string): number {
  let score = 0;

  // Word count
  const wordCount = text.split(/\s+/).length;
  score += Math.min(wordCount * 2, 30);

  // Punctuation
  const punctuationCount = (text.match(/[,，、;；:：]/g) || []).length;
  score += Math.min(punctuationCount * 5, 20);

  // Nested structures
  const nestedCount = (text.match(/[()（）""''「」【】]/g) || []).length;
  score += Math.min(nestedCount * 3, 15);

  // Abstract words
  const abstractWords = (text.match(/性|化|主义|理论|概念|本质|规律/g) || []).length;
  score += Math.min(abstractWords * 5, 20);

  return Math.min(score, 100);
}

// Debounce Hook
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

// Local Storage Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  });

  const setStoredValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    },
    [key, value]
  );

  return [value, setStoredValue] as const;
}