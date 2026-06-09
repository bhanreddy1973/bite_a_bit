'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: { label: string; onClick: () => void };
  duration?: number; // default 5000ms
  onDismiss: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'var(--color-bg-primary)',
    border: 'var(--color-success)',
    icon: 'var(--color-success)',
  },
  error: {
    bg: 'var(--color-bg-primary)',
    border: 'var(--color-error)',
    icon: 'var(--color-error)',
  },
  info: {
    bg: 'var(--color-bg-primary)',
    border: 'var(--color-primary)',
    icon: 'var(--color-primary)',
  },
  warning: {
    bg: 'var(--color-bg-primary)',
    border: 'var(--color-warning)',
    icon: 'var(--color-warning)',
  },
};

export function Toast({ message, type, action, duration = 5000, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = iconMap[type];
  const colors = colorMap[type];

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, duration);
  }, [duration, onDismiss]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Dismiss if swiped up or sideways far enough
    if (Math.abs(info.offset.y) > 50 || Math.abs(info.offset.x) > 100) {
      onDismiss();
    }
  };

  // Use assertive for errors, polite for everything else
  const ariaLive = type === 'error' ? 'assertive' : 'polite';
  const ariaRole = type === 'error' ? 'alert' : 'status';

  return (
    <AnimatePresence>
      <motion.div
        role={ariaRole}
        aria-live={ariaLive}
        aria-atomic="true"
        initial={{ opacity: 0, y: -60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onMouseEnter={clearTimer}
        onMouseLeave={startTimer}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: colors.bg,
          borderLeft: `4px solid ${colors.border}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '420px',
          width: '100%',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
          cursor: 'grab',
          touchAction: 'pan-x',
        }}
      >
        <Icon size={20} style={{ color: colors.icon, flexShrink: 0 }} aria-hidden="true" />

        <span style={{ flex: 1, lineHeight: 'var(--line-height-normal)' }}>{message}</span>

        {action && (
          <button
            onClick={action.onClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-label)',
              cursor: 'pointer',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
            }}
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}

        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-tertiary)',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default Toast;
