import { useState, useEffect, useMemo, useRef } from 'react';
import { useEyeTracking } from '../../hooks';
import type { IrisData } from '../../core/types/eye-tracking';

export interface EyeTrackingReactiveProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 眼动追踪启用时的回调 */
  onEyeTrackingData?: (data: {
    focusLevel: 'high' | 'medium' | 'low';
    blinkDetected: boolean;
    gazeVelocity: number;
    gazeDirection: { x: number; y: number };
    gazeAngle: number;
    adjustedSpeed: number;
    adjustedOpacity: number;
    adjustedBlur: number;
  }) => void;
}

/**
 * 眼动追踪响应组件
 * 根据眨眼、注视等眼动数据实时调整视觉效果
 */
export function EyeTrackingReactive({ children, onEyeTrackingData }: EyeTrackingReactiveProps) {
  const { state: eyeState, isActive, onIrisData } = useEyeTracking();
  const [focusLevel, setFocusLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [gazeVelocity, setGazeVelocity] = useState(0);
  const [gazeDirection, setGazeDirection] = useState({ x: 0, y: 0 });
  const [gazeAngle, setGazeAngle] = useState(0);
  const [lastIrisData, setLastIrisData] = useState<IrisData | null>(null);
  const [lastBlinkCount, setLastBlinkCount] = useState(0);

  // 计算注视速度和方向
  const calculateGazeVelocityAndDirection = (current: IrisData, previous: IrisData | null) => {
    if (!previous) return { velocity: 0, direction: { x: 0, y: 0 }, angle: 0 };

    const dx = current.leftIris.x - previous.leftIris.x;
    const dy = current.leftIris.y - previous.leftIris.y;
    const dt = (current.timestamp - previous.timestamp) / 1000; // 转换为秒

    if (dt === 0) return { velocity: 0, direction: { x: 0, y: 0 }, angle: 0 };

    const velocity = Math.sqrt(dx * dx + dy * dy) / dt;

    // 计算归一化方向
    const distance = Math.sqrt(dx * dx + dy * dy);
    const direction = distance > 0
      ? { x: dx / distance, y: dy / distance }
      : { x: 0, y: 0 };

    // 计算角度（度数）
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { velocity, direction, angle };
  };

  // 处理眼动数据
  const handleIrisData = (data: IrisData) => {
    const { velocity, direction, angle } = calculateGazeVelocityAndDirection(data, lastIrisData);
    setGazeVelocity(velocity);
    setGazeDirection(direction);
    setGazeAngle(angle);
    setLastIrisData(data);

    // 根据眨眼检测（通过眼动追踪状态）
    if (eyeState.blinkCount > lastBlinkCount) {
      setBlinkDetected(true);
      setLastBlinkCount(eyeState.blinkCount);
      setTimeout(() => setBlinkDetected(false), 300); // 眨眼效果持续300ms
    }

    // 根据专注度计算焦点等级
    let newFocusLevel: 'high' | 'medium' | 'low' = 'high';
    if (eyeState.focusScore < 50) {
      newFocusLevel = 'low';
    } else if (eyeState.focusScore < 80) {
      newFocusLevel = 'medium';
    }
    setFocusLevel(newFocusLevel);
  };

  // 注册虹膜数据回调
  useEffect(() => {
    if (!isActive || !onIrisData) return;

    const cleanup = onIrisData(handleIrisData);
    return cleanup;
  }, [isActive, onIrisData]);

  const params = useMemo(() => {
    // 专注度越高，速度越快，透明度越高，模糊度越低
    const speedMultiplier = focusLevel === 'high' ? 1.0 : focusLevel === 'medium' ? 0.7 : 0.4;
    const adjustedSpeed = 100 / speedMultiplier;

    const opacity = focusLevel === 'high' ? 1 : focusLevel === 'medium' ? 0.85 : 0.6;

    const blur = focusLevel === 'high' ? 0 : focusLevel === 'medium' ? 1 : 3;

    // 注视速度影响动画速度 - 注视移动快时，动画变慢
    const gazeSpeedFactor = Math.max(0.5, 1 - Math.min(1, gazeVelocity / 0.5));

    return {
      adjustedSpeed: adjustedSpeed * gazeSpeedFactor,
      adjustedOpacity: opacity,
      adjustedBlur: blur,
      focusLevel,
      blinkDetected,
      gazeVelocity,
      gazeDirection,
      gazeAngle,
    };
  }, [focusLevel, blinkDetected, gazeVelocity, gazeDirection.x, gazeDirection.y, gazeAngle]);

  // 通知父组件 - 只有当 params 值真正改变时才调用
  const lastParamsRef = useRef<typeof params | null>(null);

  useEffect(() => {
    // 检查值是否真的改变了
    const hasChanged = !lastParamsRef.current ||
      lastParamsRef.current.focusLevel !== params.focusLevel ||
      lastParamsRef.current.blinkDetected !== params.blinkDetected ||
      lastParamsRef.current.gazeVelocity !== params.gazeVelocity ||
      Math.abs(lastParamsRef.current.gazeDirection.x - params.gazeDirection.x) > 0.01 ||
      Math.abs(lastParamsRef.current.gazeDirection.y - params.gazeDirection.y) > 0.01 ||
      Math.abs(lastParamsRef.current.gazeAngle - params.gazeAngle) > 0.1 ||
      Math.abs(lastParamsRef.current.adjustedSpeed - params.adjustedSpeed) > 1 ||
      Math.abs(lastParamsRef.current.adjustedOpacity - params.adjustedOpacity) > 0.01 ||
      Math.abs(lastParamsRef.current.adjustedBlur - params.adjustedBlur) > 0.1;

    if (hasChanged && onEyeTrackingData) {
      lastParamsRef.current = params;
      onEyeTrackingData(params);
    }
  }, [params, onEyeTrackingData]);

  return (
    <div
      className={`eye-tracking-reactive ${focusLevel === 'high' ? 'focusHigh' : focusLevel === 'medium' ? 'focusMedium' : 'focusLow'} ${blinkDetected ? 'blinkEffect' : ''}`}
      style={{
        transition: 'all 0.3s ease',
      }}
    >
      {children}
    </div>
  );
}
