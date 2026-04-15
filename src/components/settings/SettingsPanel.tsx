import styles from './SettingsPanel.module.css';
import { Slider, Toggle } from '../ui';
import { APIKeyInput } from './APIKeyInput';
import { useSettings } from '../../context/SettingsContext';

export function SettingsPanel() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>设置</div>
      </div>

      {/* Breathing Settings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>呼吸排版</div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>启用呼吸动画</div>
            <div className={styles.description}>让文字随呼吸律动</div>
          </div>
          <Toggle
            checked={settings.breathing.enabled}
            onChange={(checked) => updateSettings({ breathing: { ...settings.breathing, enabled: checked } })}
          />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>呼吸速度</div>
            <div className={styles.description}>调节呼吸动画的快慢</div>
          </div>
          <div style={{ width: '200px' }}>
            <Slider
              value={settings.breathing.speed}
              min={0.1}
              max={0.3}
              onChange={(value) => updateSettings({ breathing: { ...settings.breathing, speed: value } })}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>呼吸幅度</div>
            <div className={styles.description}>调节动画的强度</div>
          </div>
          <div style={{ width: '200px' }}>
            <Slider
              value={settings.breathing.amplitude}
              min={0.5}
              max={2.0}
              onChange={(value) => updateSettings({ breathing: { ...settings.breathing, amplitude: value } })}
            />
          </div>
        </div>
      </div>

      {/* Eye Tracking Settings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>眼动追踪</div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>启用眼动追踪</div>
            <div className={styles.description}>使用摄像头智能调节阅读节奏</div>
          </div>
          <Toggle
            checked={settings.eyeTracking.enabled}
            onChange={(checked) => updateSettings({ eyeTracking: { ...settings.eyeTracking, enabled: checked } })}
          />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>显示摄像头预览</div>
            <div className={styles.description}>在界面中显示摄像头画面</div>
          </div>
          <Toggle
            checked={settings.eyeTracking.showPreview}
            onChange={(checked) => updateSettings({ eyeTracking: { ...settings.eyeTracking, showPreview: checked } })}
          />
        </div>
      </div>

      {/* Reading Settings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>阅读设置</div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>专注模式</div>
            <div className={styles.description}>减少干扰，专注阅读</div>
          </div>
          <Toggle
            checked={settings.reading.focusMode}
            onChange={(checked) => updateSettings({ reading: { ...settings.reading, focusMode: checked } })}
          />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>字体大小</div>
            <div className={styles.description}>调整阅读字体大小</div>
          </div>
          <div style={{ width: '200px' }}>
            <Slider
              value={settings.reading.fontSize}
              min={14}
              max={24}
              onChange={(value) => updateSettings({ reading: { ...settings.reading, fontSize: value } })}
            />
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>AI 设置</div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>OpenAI API Key</div>
            <div className={styles.description}>用于文本重写功能</div>
          </div>
          <APIKeyInput />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>API 模型</div>
            <div className={styles.description}>选择使用的 AI 模型</div>
          </div>
          <input
            type="text"
            value={settings.api.model}
            onChange={(e) => updateSettings({ api: { ...settings.api, model: e.target.value } })}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--ui-border)',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '200px',
            }}
          />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>Base URL</div>
            <div className={styles.description}>自定义 API 端点地址（可选）</div>
          </div>
          <input
            type="text"
            value={settings.api.baseURL}
            onChange={(e) => updateSettings({ api: { ...settings.api, baseURL: e.target.value } })}
            placeholder="http://localhost:11434/v1"
            style={{
              padding: '8px 12px',
              border: '1px solid var(--ui-border)',
              borderRadius: '6px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '300px',
            }}
          />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.label}>启用思考模式</div>
            <div className={styles.description}>允许大模型进行深度思考后再输出（默认开启）</div>
          </div>
          <Toggle
            checked={settings.api.enableThinking}
            onChange={(checked) => updateSettings({ api: { ...settings.api, enableThinking: checked } })}
          />
        </div>
      </div>
    </div>
  );
}