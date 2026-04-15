import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getAIRewriter, type RewriteMode, type RewriteResult, type RewriteRequest } from '../core/ai-rewriter';
import { useSettings } from './SettingsContext';

interface RewriterContextType {
  mode: RewriteMode;
  showOriginal: boolean;
  isLoading: boolean;
  error: string | null;
  currentResult: RewriteResult | null;
  history: RewriteResult[];
  setMode: (mode: RewriteMode) => void;
  setShowOriginal: (show: boolean) => void;
  rewrite: (text: string, context?: string) => Promise<RewriteResult>;
  clearHistory: () => void;
  hasApiKey: () => boolean;
  setApiKey: (apiKey: string) => void;
}

const RewriterContext = createContext<RewriterContextType | undefined>(undefined);

interface RewriterProviderProps {
  children: ReactNode;
}

export function RewriterProvider({ children }: RewriterProviderProps) {
  const { settings, updateSettings } = useSettings();
  const [mode, setMode] = useState<RewriteMode>('poetry');
  const [showOriginal, setShowOriginal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<RewriteResult | null>(null);
  const [history, setHistory] = useState<RewriteResult[]>([]);

  const hasApiKey = useCallback((): boolean => {
    return !!settings.api.openaiKey;
  }, [settings.api.openaiKey]);

  const setApiKey = useCallback((apiKey: string) => {
    updateSettings({ api: { ...settings.api, openaiKey: apiKey } });
  }, [settings.api, updateSettings]);

  const configureRewriter = useCallback(() => {
    const rewriter = getAIRewriter();
    rewriter.configure({
      provider: 'openai',
      apiKey: settings.api.openaiKey,
      model: settings.api.model,
      baseURL: settings.api.baseURL || undefined,
    });
  }, [settings.api.openaiKey, settings.api.model, settings.api.baseURL]);

  const rewrite = useCallback(async (text: string, context?: string): Promise<RewriteResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const rewriter = getAIRewriter();
      const request: RewriteRequest = {
        text,
        mode,
        preserveLength: true,
        context,
        enableThinking: settings.api.enableThinking,
      };

      const result = await rewriter.rewrite(request);

      setCurrentResult(result);
      setHistory(prev => [result, ...prev.slice(0, 9)]);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rewrite text';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mode, settings.api.enableThinking]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    configureRewriter();
  }, [configureRewriter]);

  return (
    <RewriterContext.Provider
      value={{
        mode,
        showOriginal,
        isLoading,
        error,
        currentResult,
        history,
        setMode,
        setShowOriginal,
        rewrite,
        clearHistory,
        hasApiKey,
        setApiKey,
      }}
    >
      {children}
    </RewriterContext.Provider>
  );
}

export function useRewriter(): RewriterContextType {
  const context = useContext(RewriterContext);
  if (!context) {
    throw new Error('useRewriter must be used within RewriterProvider');
  }
  return context;
}