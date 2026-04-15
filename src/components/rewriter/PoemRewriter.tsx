import styles from './PoemRewriter.module.css';
import { useRewriter } from '../../hooks';
import { useEyeTracking } from '../../hooks';
import { PoemDisplay } from './PoemDisplay';
import { EyeTrackingReactive } from './EyeTrackingReactive';
import { useState, useCallback, useEffect, useRef } from 'react';

export function PoemRewriter() {
  const {
    isLoading,
    error,
    currentResult,
    rewrite,
    hasApiKey,
  } = useRewriter();

  const { isActive: isEyeTrackingActive } = useEyeTracking();

  const [customText, setCustomText] = useState('');
  const [eyeTrackingParams, setEyeTrackingParams] = useState({
    adjustedSpeed: 100,
    adjustedOpacity: 1,
    adjustedBlur: 0,
    focusLevel: 'high' as 'high' | 'medium' | 'low',
    gazeDirection: { x: 0, y: 0 },
    gazeAngle: 0,
    gazeVelocity: 0,
  });
  const lastParamsRef = useRef<typeof eyeTrackingParams | null>(null);

  const handleRewrite = async () => {
    if (!customText.trim()) return;
    try {
      await rewrite(customText);
    } catch (err) {
      console.error('Rewrite error:', err);
    }
  };

  const handleEyeTrackingData = useCallback((data: any) => {
    // 检查值是否真的改变了，避免不必要的更新
    const last = lastParamsRef.current;
    if (last &&
        last.focusLevel === data.focusLevel &&
        Math.abs(last.gazeDirection.x - data.gazeDirection.x) < 0.01 &&
        Math.abs(last.gazeDirection.y - data.gazeDirection.y) < 0.01 &&
        Math.abs(last.gazeAngle - data.gazeAngle) < 0.1 &&
        Math.abs(last.gazeVelocity - data.gazeVelocity) < 1 &&
        Math.abs(last.adjustedSpeed - data.adjustedSpeed) < 1 &&
        Math.abs(last.adjustedOpacity - data.adjustedOpacity) < 0.01 &&
        Math.abs(last.adjustedBlur - data.adjustedBlur) < 0.1) {
      return;
    }

    lastParamsRef.current = {
      adjustedSpeed: data.adjustedSpeed,
      adjustedOpacity: data.adjustedOpacity,
      adjustedBlur: data.adjustedBlur,
      focusLevel: data.focusLevel,
      gazeDirection: data.gazeDirection,
      gazeAngle: data.gazeAngle,
      gazeVelocity: data.gazeVelocity,
    };

    setEyeTrackingParams(lastParamsRef.current);
  }, []);

  // 将诗歌文本按行分割
  const poemLines = currentResult?.rewrittenText
    ? currentResult.rewrittenText.split('\n').filter(line => line.trim())
    : [];

  return (
    <div className={styles.container}>
      {/* 输入区域 */}
      <div className={styles.inputSection}>
        <h2 className={styles.title}>诗歌生成器</h2>
        <p className={styles.description}>
          输入任意文案，AI 将其转化为富有韵律和美感的诗歌
        </p>

        {!hasApiKey() && (
          <div className={styles.warning}>
            请先在「设置」页面配置 API Key 才能使用诗歌生成功能
          </div>
        )}

        <textarea
          className={styles.textarea}
          placeholder="在此输入您的文案...&#10;&#10;例如：&#10;今天天气真好，阳光明媚，微风轻拂，让人心情愉悦。"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={4}
          disabled={!hasApiKey()}
        />

        <div className={styles.actions}>
          <button
            className="button primary"
            onClick={handleRewrite}
            disabled={isLoading || !customText.trim() || !hasApiKey()}
          >
            {isLoading ? '生成中...' : '生成诗歌'}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* 诗歌展示区域 */}
      {currentResult && poemLines.length > 0 && (
        <div className={styles.displaySection}>
          <div className={styles.displayHeader}>
            <h3 className={styles.displayTitle}>生成的诗歌</h3>
            {isEyeTrackingActive && (
              <div className={styles.eyeTrackingStatus}>
                <span className={styles.statusDot} />
                眼动追踪已启用
              </div>
            )}
          </div>

          <EyeTrackingReactive onEyeTrackingData={handleEyeTrackingData}>
            <PoemDisplay
              lines={poemLines}
              isAnimating={true}
              animationSpeed={eyeTrackingParams.adjustedSpeed}
              opacity={eyeTrackingParams.adjustedOpacity}
              blur={eyeTrackingParams.adjustedBlur}
              gazeDirection={eyeTrackingParams.gazeDirection}
              gazeAngle={eyeTrackingParams.gazeAngle}
              gazeVelocity={eyeTrackingParams.gazeVelocity}
            />
          </EyeTrackingReactive>
        </div>
      )}

      {/* 空状态提示 */}
      {!isLoading && !error && !currentResult && hasApiKey() && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎭</div>
          <p className={styles.emptyText}>
            输入文案，点击「生成诗歌」，观看AI创作的动态诗歌展示
          </p>
          {isEyeTrackingActive && (
            <p className={styles.eyeTrackingHint}>
              💡 眼动追踪已启用：您的注视和眨眼将实时影响诗歌的显示效果
            </p>
          )}
        </div>
      )}
    </div>
  );
}
