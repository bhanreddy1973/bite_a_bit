export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { category: ErrorCategory; message: string } };

export type ErrorCategory =
  | 'network'
  | 'permission'
  | 'not-found'
  | 'timeout'
  | 'validation'
  | 'unknown';

export type ThemePreference = 'light' | 'dark' | 'system';
