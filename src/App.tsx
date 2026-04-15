import { useState, useEffect } from 'react';
import { ReadingView } from './components/reading';
import { PoemRewriter } from './components/rewriter';
import { EyeTrackingSetup } from './components/eye-tracking';
import { SettingsPanel } from './components/settings';
import { FocusModeToggle } from './components/reading/FocusModeToggle';
import { BreathingAnimation } from './components/breathing-guide/BreathingAnimation';
import { useBreathing } from './hooks';

// Sample text for demonstration
const SAMPLE_TEXT = `认知禅意呼吸阅读器旨在将长文阅读转化为深度理解与数字冥想的体验。

在现代信息爆炸的时代，我们每天被无数的信息所包围。快速浏览和碎片化阅读成为了常态，但我们真正理解和吸收的内容却越来越少。认知禅意呼吸阅读器通过独特的呼吸排版技术，将文本与呼吸节奏同步，帮助读者进入一种"心流"状态。

呼吸排版的核心理念源于古老的冥想传统和现代的认知科学。研究表明，当呼吸节奏与阅读节奏同步时，大脑的认知负荷会降低，理解和记忆能力会显著提升。通过调节文字的行高、字间距和呼吸动画，我们让阅读本身成为一种冥想练习。

在这个系统中，每一段文字都会根据其复杂度自动调整排版。复杂的句子会有更多的呼吸空间，简单的段落则更加紧凑。这种动态的排版让读者在阅读时自然而然地调整呼吸节奏，实现与文字的和谐共鸣。

更重要的是，通过眼动追踪技术，系统可以实时监测读者的专注度和疲劳程度。当检测到读者注意力不集中或感到疲劳时，系统会自动调整阅读节奏，放慢文字速度，给予大脑更多的休息时间。

AI 重写功能则提供了五种不同的叙事风格：童话风格温柔奇幻，现实风格平实直接，叙事诗风格富有韵律，跨学科风格提供多视角洞察，禅意公案风格引发深层思考。这些不同的模式让读者可以从多个角度理解和消化同一内容。

使用认知禅意呼吸阅读器，阅读不再是信息的被动接收，而是一场主动的认知探索。每一次呼吸，都是与文字的对话；每一次凝视，都是思维的深化。这种阅读方式不仅提高了理解和记忆，更培养了专注力和内心的平静。

让我们从现在开始，重新定义阅读的体验。让每一次阅读都成为一次心灵的旅行，让每一次呼吸都成为一次认知的觉醒。`;

function App() {
  const [activeTab, setActiveTab] = useState<'reading' | 'rewriter' | 'eyetracking' | 'settings'>('reading');
  const { state: breathingState, isRunning: breathingRunning, start: startBreathing, stop: stopBreathing } = useBreathing();

  useEffect(() => {
    // Start breathing animation on mount
    startBreathing();

    return () => {
      stopBreathing();
    };
  }, [startBreathing, stopBreathing]);

  const tabs = [
    { id: 'reading' as const, label: '阅读', icon: '📖' },
    { id: 'rewriter' as const, label: 'AI 诗歌', icon: '✨' },
    { id: 'eyetracking' as const, label: '眼动追踪', icon: '👁️' },
    { id: 'settings' as const, label: '设置', icon: '⚙️' },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--ui-border)',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '500', margin: 0, color: 'var(--text-primary)' }}>
              认知禅意呼吸阅读器
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
              深度阅读 · 数字冥想 · 认知重构
            </p>
          </div>
          <FocusModeToggle />
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        padding: '0 24px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--ui-border)',
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontSize: '0.9rem',
                fontWeight: activeTab === tab.id ? '500' : '400',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-calm)' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ marginRight: '6px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'reading' && (
          <div>
            {/* Breathing Status Indicator */}
            {breathingRunning && (
              <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--ui-border)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px var(--ui-shadow)',
                zIndex: 100,
              }}>
                <BreathingAnimation state={breathingState} />
              </div>
            )}
            <ReadingView text={SAMPLE_TEXT} />
          </div>
        )}

        {activeTab === 'rewriter' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '16px' }}>
              AI 诗歌生成
            </h2>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>
              输入文案，AI 将其转化为富有韵律和美感的诗歌。启用眼动追踪可实时调整展示效果。
            </p>
            <PoemRewriter />
          </div>
        )}

        {activeTab === 'eyetracking' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '16px' }}>
              眼动追踪
            </h2>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>
              通过摄像头检测注视点和眨眼频率，智能调节阅读节奏
            </p>
            <EyeTrackingSetup />
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <SettingsPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--ui-border)',
        background: 'var(--bg-primary)',
      }}>
        <p style={{ margin: 0 }}>
          认知禅意呼吸阅读器 · 将阅读转化为深度理解与数字冥想
        </p>
      </footer>
    </div>
  );
}

export default App;