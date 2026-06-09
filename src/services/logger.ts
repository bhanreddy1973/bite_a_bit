/**
 * Structured logger service for the Bite a Bit application.
 * Logs to the browser console with structured metadata including
 * timestamp, level, type, message, and optional context.
 */

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  type: string;
  message: string;
  context?: Record<string, unknown>;
}

function createLogEntry(
  level: LogEntry['level'],
  type: string,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    type,
    message,
    ...(context !== undefined && { context }),
  };
}

/**
 * Logs an error-level entry to the console with structured metadata.
 */
export function logError(type: string, message: string, context?: Record<string, unknown>): void {
  const entry = createLogEntry('error', type, message, context);
  console.error(`[${entry.level.toUpperCase()}] ${entry.type}: ${entry.message}`, entry);
}

/**
 * Logs a warn-level entry to the console with structured metadata.
 */
export function logWarn(type: string, message: string, context?: Record<string, unknown>): void {
  const entry = createLogEntry('warn', type, message, context);
  console.warn(`[${entry.level.toUpperCase()}] ${entry.type}: ${entry.message}`, entry);
}

/**
 * Logs an info-level entry to the console with structured metadata.
 */
export function logInfo(type: string, message: string, context?: Record<string, unknown>): void {
  const entry = createLogEntry('info', type, message, context);
  console.info(`[${entry.level.toUpperCase()}] ${entry.type}: ${entry.message}`, entry);
}
