/**
 * PathNER — Ultra-Fast Low-Network & Offline IndexedDB Storage Engine
 * Enables instant 0ms map rendering and 100% resilience during low/zero connectivity.
 */

class OfflineCache {
  constructor(dbName = 'PathNER_DB', storeName = 'offline_telemetry', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.db = null;
    this._initPromise = this._initDB();
  }

  async _initDB() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported; fallback to memory');
      return null;
    }
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = () => {
        console.warn('IndexedDB open error');
        resolve(null);
      };
    });
  }

  async get(key) {
    await this._initPromise;
    if (!this.db) {
      try {
        const raw = localStorage.getItem('pner_' + key);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async set(key, value) {
    await this._initPromise;
    if (!this.db) {
      try { localStorage.setItem('pner_' + key, JSON.stringify(value)); } catch {}
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(value, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async fetchWithCache(url, cacheKey, onCachedData, onFreshData) {
    // 1. Instantly return cached copy if available
    const cached = await this.get(cacheKey);
    if (cached) {
      if (onCachedData) onCachedData(cached);
    }

    // 2. Fetch fresh network data in parallel (low-priority background fetch)
    try {
      const res = await fetch(url, { headers: { 'Accept-Encoding': 'gzip, deflate' } });
      const data = await res.json();
      if (data && data.status === 'success') {
        this.set(cacheKey, data);
        if (onFreshData) onFreshData(data);
      }
      return data;
    } catch (err) {
      console.warn(`[OfflineEngine] Network unavailable for ${url}. Operating on cached topology.`);
      return cached;
    }
  }
}

window.offlineCache = new OfflineCache();
