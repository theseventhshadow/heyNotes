const STORAGE_PREFIX = 'heynotes:';

export const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },
};
