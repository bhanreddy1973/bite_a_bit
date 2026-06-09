/**
 * Safely retrieves and parses a JSON value from localStorage.
 * Returns null if the key doesn't exist, parsing fails, or localStorage is unavailable.
 */
export function safeGetItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch {
    return null;
  }
}

/**
 * Safely stores a value in localStorage as JSON.
 * Catches errors from JSON.stringify or localStorage quota/access issues.
 * Returns true on success, false on failure.
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
