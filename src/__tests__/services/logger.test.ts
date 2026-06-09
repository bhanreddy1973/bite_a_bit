import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logError, logWarn, logInfo, LogEntry } from '@/services/logger';

describe('Logger Service', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logError', () => {
    it('logs to console.error with structured entry', () => {
      logError('NETWORK_ERROR', 'Failed to fetch menu');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const [message, entry] = consoleErrorSpy.mock.calls[0];
      expect(message).toBe('[ERROR] NETWORK_ERROR: Failed to fetch menu');
      expect(entry.level).toBe('error');
      expect(entry.type).toBe('NETWORK_ERROR');
      expect(entry.message).toBe('Failed to fetch menu');
      expect(entry.timestamp).toBeDefined();
    });

    it('includes context when provided', () => {
      const context = { component: 'MenuGrid', action: 'fetchItems', statusCode: 500 };
      logError('NETWORK_ERROR', 'Request failed', context);

      const [, entry] = consoleErrorSpy.mock.calls[0];
      expect(entry.context).toEqual(context);
    });

    it('omits context field when not provided', () => {
      logError('RENDER_ERROR', 'Component crashed');

      const [, entry] = consoleErrorSpy.mock.calls[0];
      expect(entry).not.toHaveProperty('context');
    });
  });

  describe('logWarn', () => {
    it('logs to console.warn with structured entry', () => {
      logWarn('CACHE_STALE', 'Menu cache is stale');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const [message, entry] = consoleWarnSpy.mock.calls[0];
      expect(message).toBe('[WARN] CACHE_STALE: Menu cache is stale');
      expect(entry.level).toBe('warn');
      expect(entry.type).toBe('CACHE_STALE');
      expect(entry.message).toBe('Menu cache is stale');
    });

    it('includes context when provided', () => {
      const context = { component: 'MenuCacheStore', cacheAge: 360000 };
      logWarn('CACHE_STALE', 'Data expired', context);

      const [, entry] = consoleWarnSpy.mock.calls[0];
      expect(entry.context).toEqual(context);
    });
  });

  describe('logInfo', () => {
    it('logs to console.info with structured entry', () => {
      logInfo('AUTH_SUCCESS', 'User logged in');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const [message, entry] = consoleInfoSpy.mock.calls[0];
      expect(message).toBe('[INFO] AUTH_SUCCESS: User logged in');
      expect(entry.level).toBe('info');
      expect(entry.type).toBe('AUTH_SUCCESS');
      expect(entry.message).toBe('User logged in');
    });

    it('includes context when provided', () => {
      const context = { component: 'LoginForm', userId: 'user-123' };
      logInfo('AUTH_SUCCESS', 'User authenticated', context);

      const [, entry] = consoleInfoSpy.mock.calls[0];
      expect(entry.context).toEqual(context);
    });
  });

  describe('LogEntry structure', () => {
    it('produces ISO 8601 timestamp', () => {
      logInfo('TEST', 'Timestamp check');

      const [, entry] = consoleInfoSpy.mock.calls[0];
      // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
    });

    it('includes all required fields', () => {
      logError('VALIDATION_ERROR', 'Invalid input', { field: 'phone' });

      const [, entry]: [string, LogEntry] = consoleErrorSpy.mock.calls[0];
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('type');
      expect(entry).toHaveProperty('message');
      expect(entry).toHaveProperty('context');
    });
  });
});
