import styles from './RewriterPanel.module.css';
import { useRewriter } from '../../hooks';
import { ModeSelector } from './ModeSelector';
import { OriginalToggle } from './OriginalToggle';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface RewriterPanelProps {
  text: string;
}

export function RewriterPanel({ text }: RewriterPanelProps) {
  const {
    mode,
    showOriginal,
    isLoading,
    error,
    currentResult,
    setMode,
    setShowOriginal,
    rewrite,
    hasApiKey,
  } = useRewriter();

  const handleRewrite = async () => {
    try {
      await rewrite(text);
    } catch (err) {
      console.error('Rewrite error:', err);
    }
  };

  const displayText = showOriginal ? text : currentResult?.rewrittenText || '';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>AI 重写</div>
        <div className={styles.actions}>
          <OriginalToggle
            show={showOriginal}
            onToggle={setShowOriginal}
            hasResult={!!currentResult}
          />
          <button
            className="button primary"
            onClick={handleRewrite}
            disabled={isLoading}
          >
            {isLoading ? '重写中...' : '开始重写'}
          </button>
        </div>
      </div>

      <ModeSelector currentMode={mode} onModeChange={setMode} />

      <div className={styles.content}>
        {!hasApiKey() && (
          <div className={styles.warning}>
            请先在「设置」页面配置 API Key 才能使用 AI 重写功能
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        )}

        {!isLoading && !error && currentResult && (
          <>
            <div className={styles.originalText}>
              原文：{text}
            </div>
            <div className={styles.rewrittenText}>
              {displayText}
            </div>
            <ConfidenceIndicator confidence={currentResult.confidence} />
          </>
        )}

        {!isLoading && !error && !currentResult && hasApiKey() && (
          <div className={styles.originalText}>
            选择一种模式，点击"开始重写"来转换文本风格
          </div>
        )}

        {!isLoading && !error && !currentResult && !hasApiKey() && (
          <div className={styles.originalText}>
            配置 API Key 后即可开始使用 AI 重写功能
          </div>
        )}
      </div>
    </div>
  );
}