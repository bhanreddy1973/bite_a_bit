import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/uiStore';

describe('useToast', () => {
  beforeEach(() => {
    useUIStore.setState({ toasts: [] });
  });

  it('starts with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast({
        message: 'Item added to cart',
        type: 'success',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Item added to cart');
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('removes a toast by id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast({
        message: 'Test toast',
        type: 'info',
      });
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast({ message: 'First', type: 'success' });
      result.current.addToast({ message: 'Second', type: 'error' });
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].message).toBe('First');
    expect(result.current.toasts[1].message).toBe('Second');
  });

  it('supports toast with action', () => {
    const { result } = renderHook(() => useToast());
    const onClickMock = vi.fn();

    act(() => {
      result.current.addToast({
        message: 'Failed to load',
        type: 'error',
        action: { label: 'Retry', onClick: onClickMock },
      });
    });

    expect(result.current.toasts[0].action).toBeDefined();
    expect(result.current.toasts[0].action!.label).toBe('Retry');
  });
});
