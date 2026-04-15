import { forwardRef, useEffect } from 'react';
import styles from './CameraPreview.module.css';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  showPreview: boolean;
}

export const CameraPreview = forwardRef<HTMLDivElement, CameraPreviewProps>(
  ({ videoRef, isActive, showPreview }, forwardedRef) => {
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Request camera permission and start video
      if (isActive) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'user' } })
          .then(stream => {
            video.srcObject = stream;
            video.play().catch(console.error);
          })
          .catch(err => {
            console.error('Camera error:', err);
          });
      } else {
        // Stop video tracks
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      }

      return () => {
        // Cleanup
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }, [isActive, videoRef]);

    if (!showPreview) return null;

    return (
      <div ref={forwardedRef} className={styles.preview}>
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          className={styles.video}
          muted
          playsInline
        />
        <div className={styles.indicator}>
          <span className={`${styles.indicatorDot} ${isActive ? styles.active : ''}`} />
          {isActive ? '追踪中' : '待机'}
        </div>
        <div className={`${styles.overlay} ${isActive ? styles.hidden : ''}`}>
          摄像头预览
        </div>
      </div>
    );
  }
);

CameraPreview.displayName = 'CameraPreview';