export const storage = {
  get(key, fallback = null) {
    if (typeof window === "undefined") return fallback;
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};