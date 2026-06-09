'use client';

import React, { useId, useState } from 'react';

export interface InputProps {
  label: string;
  type: 'text' | 'tel' | 'email' | 'search';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Input({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  icon,
  disabled = false,
}: InputProps) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2, 8px)',
    position: 'relative',
    border: `1.5px solid ${error ? 'var(--color-error, #FF3B30)' : isFocused ? 'var(--color-primary, #007AFF)' : 'var(--color-border, #D1D1D6)'}`,
    borderRadius: 'var(--radius-md, 8px)',
    background: disabled ? 'var(--color-bg-secondary, #F2F2F7)' : 'var(--color-surface, #FFFFFF)',
    padding: 'var(--space-3, 12px) var(--space-4, 16px)',
    transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
    minHeight: '56px',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : undefined,
    boxShadow: isFocused
      ? error
        ? '0 0 0 3px rgba(255, 59, 48, 0.15)'
        : '0 0 0 3px var(--color-primary-light, #E5F2FF)'
      : undefined,
  };

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isFocused ? 'var(--color-primary, #007AFF)' : 'var(--color-text-tertiary, #8E8E93)',
    flexShrink: 0,
    width: '20px',
    height: '20px',
  };

  const fieldWrapperStyle: React.CSSProperties = {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-family, Inter, -apple-system, sans-serif)',
    fontSize: 'var(--font-size-body, 16px)',
    fontWeight: 'var(--font-weight-regular, 400)' as React.CSSProperties['fontWeight'],
    lineHeight: 'var(--line-height-normal, 1.5)',
    color: 'var(--color-text-primary, #1C1C1E)',
    padding: '10px 0 0 0',
    minHeight: '28px',
    cursor: disabled ? 'not-allowed' : undefined,
  };

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: isFloating ? '2px' : '50%',
    transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
    fontFamily: 'var(--font-family, Inter, -apple-system, sans-serif)',
    fontSize: isFloating ? 'var(--font-size-caption, 12px)' : 'var(--font-size-body, 16px)',
    fontWeight: isFloating
      ? ('var(--font-weight-medium, 500)' as React.CSSProperties['fontWeight'])
      : ('var(--font-weight-regular, 400)' as React.CSSProperties['fontWeight']),
    color: isFloating
      ? error
        ? 'var(--color-error, #FF3B30)'
        : isFocused
          ? 'var(--color-primary, #007AFF)'
          : 'var(--color-text-secondary, #3C3C43)'
      : 'var(--color-text-tertiary, #8E8E93)',
    pointerEvents: 'none',
    transition:
      'transform 150ms ease-out, font-size 150ms ease-out, color 150ms ease-out, top 150ms ease-out',
    transformOrigin: 'left center',
  };

  const errorStyle: React.CSSProperties = {
    margin: 0,
    padding: 'var(--space-1, 4px) 0 0 0',
    fontFamily: 'var(--font-family, Inter, -apple-system, sans-serif)',
    fontSize: 'var(--font-size-caption, 12px)',
    fontWeight: 'var(--font-weight-regular, 400)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-error, #FF3B30)',
    lineHeight: 'var(--line-height-normal, 1.5)',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1, 4px)',
        width: '100%',
      }}
      data-testid="input-wrapper"
    >
      <div style={containerStyle} data-testid="input-container">
        {icon && (
          <span style={iconStyle} data-testid="input-icon">
            {icon}
          </span>
        )}
        <div style={fieldWrapperStyle}>
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFloating ? placeholder : undefined}
            disabled={disabled}
            style={fieldStyle}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <label htmlFor={id} style={labelStyle} data-testid="input-label">
            {label}
          </label>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
