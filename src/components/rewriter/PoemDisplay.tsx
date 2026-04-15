import styles from './PoemDisplay.module.css';
import { useMemo } from 'react';

interface PoemDisplayProps {
  /** 诗歌文本，按行分割 */
  lines: string[];
  /** 是否正在显示动画 */
  isAnimating?: boolean;
  /** 动画速度 (ms/字)，越小越快 */
  animationSpeed?: number;
  /** 行间延迟 (ms) */
  lineDelay?: number;
  /** 透明度 */
  opacity?: number;
  /** 模糊度 */
  blur?: number;
  /** 字体大小 */
  fontSize?: number;
  /** 行高 */
  lineHeight?: number;
  /** 眼动方向向量 */
  gazeDirection?: { x: number; y: number };
  /** 眼动角度 */
  gazeAngle?: number;
  /** 眼动速度 */
  gazeVelocity?: number;
}

// 根据眼动方向生成颜色主题
const getColorFromDirection = (direction: { x: number; y: number }, charIndex: number): string => {
  const hue = ((direction.x + 1) * 60 + (direction.y + 1) * 30 + charIndex * 5) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

// 计算跳跃偏移量
const getJumpOffset = (direction: { x: number; y: number }, charIndex: number, lineIndex: number) => {
  const jumpIntensity = 8; // 跳跃幅度
  const offset = Math.sin(charIndex * 0.5 + lineIndex) * jumpIntensity;
  return {
    x: direction.x * offset,
    y: direction.y * offset,
  };
};

export function PoemDisplay({
  lines,
  isAnimating = true,
  animationSpeed = 100,
  lineDelay = 500,
  opacity = 1,
  blur = 0,
  fontSize = 1.5,
  lineHeight = 2,
  gazeDirection = { x: 0, y: 0 },
  gazeAngle = 0,
  gazeVelocity = 0,
}: PoemDisplayProps) {
  // 计算是否应该跳动（眼动速度超过阈值）
  const shouldJump = gazeVelocity > 50;

  // 为每个字符生成颜色和动画偏移
  const charStyles = useMemo(() => {
    const result: Array<{ color: string; offsetX: number; offsetY: number }> = [];

    lines.forEach((line, lineIndex) => {
      line.split('').forEach((char, charIndex) => {
        if (char === ' ') {
          result.push({ color: 'inherit', offsetX: 0, offsetY: 0 });
          return;
        }

        const globalCharIndex = lines.slice(0, lineIndex).reduce((sum, l) => sum + l.length, 0) + charIndex;
        result.push({
          color: getColorFromDirection(gazeDirection, globalCharIndex),
          ...getJumpOffset(gazeDirection, charIndex, lineIndex),
        });
      });
    });

    return result;
  }, [lines, gazeDirection]);

  let charStyleIndex = 0;

  return (
    <div
      className={`${styles.poemDisplay} ${shouldJump ? styles.jumping : ''}`}
      style={{
        '--font-size': `${fontSize}rem`,
        '--line-height': `${lineHeight}rem`,
        '--opacity': opacity,
        '--blur': `${blur}px`,
        '--jump-x': `${gazeDirection.x * 10}px`,
        '--jump-y': `${gazeDirection.y * 10}px`,
      } as React.CSSProperties}
    >
      {lines.map((line, lineIndex) => (
        <div
          key={lineIndex}
          className={styles.line}
          style={{
            animationDelay: isAnimating
              ? `${(lines.slice(0, lineIndex).reduce((sum, l) => sum + l.length, 0) * animationSpeed) + (lineIndex * lineDelay)}ms`
              : undefined,
          }}
        >
          {line.split('').map((char, charIndex) => {
            const style = charStyles[charStyleIndex++];
            return (
              <span
                key={charIndex}
                className={`${styles.char} ${shouldJump ? styles.jump : ''}`}
                style={{
                  animationDelay: isAnimating
                    ? `${(lineIndex * lineDelay) + (charIndex * animationSpeed)}ms`
                    : undefined,
                  color: shouldJump ? style.color : undefined,
                  '--jump-offset-x': `${style.offsetX}px`,
                  '--jump-offset-y': `${style.offsetY}px`,
                } as React.CSSProperties}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
