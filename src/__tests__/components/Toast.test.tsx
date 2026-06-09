import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toast } from '../../components/ui/Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message text', () => {
    render(<Toast message="Item added to cart" type="success" onDismiss={() => {}} />);
    expect(screen.getByText('Item added to cart')).toBeInTheDocument();
  });

  it('uses assertive aria-live for error type', () => {
    render(<Toast message="Network error" type="error" onDismiss={() => {}} />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('uses polite aria-live for info type', () => {
    render(<Toast message="Info update" type="info" onDismiss={() => {}} />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('uses polite aria-live for success type', () => {
    render(<Toast message="Success" type="success" onDismiss={() => {}} />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-dismisses after default duration (5000ms)', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Auto dismiss" type="info" onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after custom duration', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Custom" type="warning" duration={3000} onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders action button when action prop is provided', () => {
    const handleAction = vi.fn();
    render(
      <Toast
        message="Failed"
        type="error"
        action={{ label: 'Retry', onClick: handleAction }}
        onDismiss={() => {}}
      />
    );

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('dismiss button calls onDismiss', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Dismiss me" type="info" onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismiss button meets 44x44 minimum touch target', () => {
    render(<Toast message="Test" type="info" onDismiss={() => {}} />);
    const dismissButton = screen.getByLabelText('Dismiss notification');
    expect(dismissButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });
});
