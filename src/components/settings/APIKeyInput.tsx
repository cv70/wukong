import { useState, useEffect } from 'react';
import styles from './APIKeyInput.module.css';
import { useSettings } from '../../context/SettingsContext';

export function APIKeyInput() {
  const { settings, updateSettings } = useSettings();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  useEffect(() => {
    // Load API key from settings
    if (settings.api.openaiKey) {
      setStatus({ type: 'success', message: 'API Key 已设置' });
    }
  }, [settings.api.openaiKey]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'error', message: '请输入 API Key' });
      return;
    }

    // Save to settings context (which will persist to storage)
    updateSettings({ api: { ...settings.api, openaiKey: apiKey.trim() } });
    setStatus({ type: 'success', message: 'API Key 已保存' });
    setApiKey('');
  };

  return (
    <div className={styles.container}>
      <input
        type={showKey ? 'text' : 'password'}
        className={`${styles.input} ${!showKey ? styles.secure : ''}`}
        placeholder="sk-..."
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <div className={styles.actions}>
        <button
          className={styles.saveButton}
          onClick={() => setShowKey(!showKey)}
        >
          {showKey ? '隐藏' : '显示'}
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSave}
        >
          保存
        </button>
      </div>
      {status.type && (
        <div className={`${styles.status} ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}