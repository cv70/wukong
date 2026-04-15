import { useRef, useEffect, useState } from 'react';
import styles from './EyeTrackingSetup.module.css';
import { useEyeTracking } from '../../hooks';
import { CameraPreview } from './CameraPreview';
import { TrackingStatus } from './TrackingStatus';

export function EyeTrackingSetup() {
  const {
    isInitialized,
    isActive,
    state,
    initialize,
    start,
    stop,
  } = useEyeTracking();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(state.error);
  }, [state.error]);

  const handleInitialize = async () => {
    setError(null);
    try {
      await initialize();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize eye tracking');
    }
  };

  const handleStart = async () => {
    if (!videoRef.current) return;

    setError(null);
    try {
      await start(videoRef.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start eye tracking');
    }
  };

  const handleStop = async () => {
    setError(null);
    try {
      await stop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop eye tracking');
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>眼动追踪</div>
        <div className={styles.status}>
          <span className={`${styles.statusDot} ${isActive ? styles.active : ''}`} />
          {isActive ? '运行中' : isInitialized ? '已就绪' : '未初始化'}
        </div>
      </div>

      <div className={styles.content}>
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.actions}>
          {!isInitialized && (
            <button
              className="button primary"
              onClick={handleInitialize}
            >
              初始化
            </button>
          )}

          {isInitialized && !isActive && (
            <button
              className="button primary"
              onClick={handleStart}
            >
              启动追踪
            </button>
          )}

          {isActive && (
            <button
              className="button"
              onClick={handleStop}
            >
              停止追踪
            </button>
          )}
        </div>

        {isInitialized && (
          <>
            <CameraPreview
              videoRef={videoRef}
              isActive={isActive}
              showPreview={true}
            />

            <TrackingStatus state={state} />
          </>
        )}

        <div className={styles.info}>
          眼动追踪功能使用摄像头检测您的注视点和眨眼频率，用于智能调节阅读节奏。所有数据在本地处理，不会上传到服务器。
        </div>

        <div className={styles.privacyNote}>
          🔒 隐私保护：视频流仅在您的浏览器中本地处理，我们不会收集或存储任何视频数据。您可以随时关闭此功能。
        </div>
      </div>
    </div>
  );
}