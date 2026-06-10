import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

// Component that throws an error on render for testing ErrorBoundary
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child component throws', () => {
    // Suppress console.error for expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test render error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('resets error state when "Try Again" is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let shouldThrow = true;
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Set shouldThrow to false before clicking retry
    shouldThrow = false;
    rerender(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>,
    );

    // Click "Try Again" to reset error state
    fireEvent.click(screen.getByText('Try Again'));

    // After retry, the component re-renders children
    expect(screen.getByText('Normal content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('logs the error via structured logging', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Verify that console.error was called with structured log data
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('RENDER_ERROR'),
      expect.objectContaining({
        level: 'error',
        type: 'RENDER_ERROR',
        message: 'Test render error',
      }),
    );

    consoleSpy.mockRestore();
  });
});

describe('EmptyState', () => {
  it('renders with title only', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No items found');
  });

  it('renders with title and message', () => {
    render(<EmptyState title="No orders" message="You haven't placed any orders yet." />);
    expect(screen.getByText('No orders')).toBeInTheDocument();
    expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const icon = <svg data-testid="test-icon" />;
    render(<EmptyState title="Empty" icon={icon} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders action button and handles click', () => {
    const onAction = vi.fn();
    render(
      <EmptyState title="No items" actionLabel="Browse Menu" onAction={onAction} />,
    );

    const button = screen.getByText('Browse Menu');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Browse Menu');

    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when actionLabel is missing', () => {
    const onAction = vi.fn();
    render(<EmptyState title="No items" onAction={onAction} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render action button when onAction is missing', () => {
    render(<EmptyState title="No items" actionLabel="Click me" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not render message when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});

describe('LoadingScreen', () => {
  it('renders loading text', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('has proper accessibility role and label', () => {
    render(<LoadingScreen />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders the spinner element', () => {
    const { container } = render(<LoadingScreen />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
});
