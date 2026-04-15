// Secure Storage - Encrypted Local Storage Wrapper

const ENCRYPTION_KEY = 'cognitive_zen_reader_2024';

/**
 * Simple XOR-based encryption for API keys (not cryptographically secure, but obscures data)
 */
function encrypt(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  return btoa(result);
}

/**
 * Decrypt the XOR-encrypted text
 */
function decrypt(encrypted: string): string {
  try {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

const STORAGE_PREFIX = 'czr_';

/**
 * Secure storage interface
 */
export const secureStorage = {
  /**
   * Store an API key securely
   */
  setApiKey(provider: string, key: string): void {
    const encrypted = encrypt(key);
    localStorage.setItem(`${STORAGE_PREFIX}api_${provider}`, encrypted);
  },

  /**
   * Retrieve an API key
   */
  getApiKey(provider: string): string | null {
    const encrypted = localStorage.getItem(`${STORAGE_PREFIX}api_${provider}`);
    if (!encrypted) return null;
    return decrypt(encrypted);
  },

  /**
   * Remove an API key
   */
  removeApiKey(provider: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}api_${provider}`);
  },

  /**
   * Store a generic value
   */
  set<T>(key: string, value: T): void {
    const json = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, json);
  },

  /**
   * Retrieve a generic value
   */
  get<T>(key: string): T | null {
    const json = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  },

  /**
   * Remove a value
   */
  remove(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  /**
   * Clear all app storage
   */
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * Check if an API key exists
   */
  hasApiKey(provider: string): boolean {
    return !!localStorage.getItem(`${STORAGE_PREFIX}api_${provider}`);
  },
};

/**
 * Cache storage for AI rewrites
 */
export const cacheStorage = {
  /**
   * Generate a cache key from text and mode
   */
  generateKey(text: string, mode: string): string {
    const hash = simpleHash(text + mode);
    return `cache_${hash}`;
  },

  /**
   * Store a cached result
   */
  set<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    secureStorage.set(key, item);
  },

  /**
   * Get a cached result if not expired
   */
  get<T>(key: string): T | null {
    const item = secureStorage.get<{ value: T; timestamp: number; ttl: number }>(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      secureStorage.remove(key);
      return null;
    }

    return item.value;
  },

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`${STORAGE_PREFIX}cache_`)) {
        const item = secureStorage.get<{ timestamp: number; ttl: number }>(
          key.replace(STORAGE_PREFIX, '')
        );
        if (item && Date.now() - item.timestamp > item.ttl) {
          secureStorage.remove(key.replace(STORAGE_PREFIX, ''));
        }
      }
    });
  },
};

/**
 * Simple hash function for cache keys
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}