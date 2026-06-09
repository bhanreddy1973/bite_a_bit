import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      whileHover,
      whileTap,
      transition,
      ...props
    }: React.ComponentProps<'button'> & {
      whileHover?: unknown;
      whileTap?: unknown;
      transition?: unknown;
    }) => <button {...props}>{children}</button>,
  },
}));

describe('Button', () => {
  it('renders children text', () => {
    render(
      <Button variant="primary" size="md">
        Click me
      </Button>
    );
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(
      <Button variant="primary" size="md">
        Primary
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ borderRadius: 'var(--radius-pill)' });
  });

  it('applies secondary variant styles', () => {
    render(
      <Button variant="secondary" size="md">
        Secondary
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ borderRadius: 'var(--radius-lg)' });
  });

  it('applies ghost variant styles', () => {
    render(
      <Button variant="ghost" size="md">
        Ghost
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ borderRadius: 'var(--radius-lg)' });
    expect(btn).toHaveClass('btn-variant-ghost');
  });

  it('applies danger variant styles', () => {
    render(
      <Button variant="danger" size="md">
        Delete
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ borderRadius: 'var(--radius-lg)' });
  });

  it('applies size sm with minimum 44px tap target', () => {
    render(
      <Button variant="primary" size="sm">
        Small
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ minHeight: '44px', minWidth: '44px' });
  });

  it('applies size md with minimum 44px tap target', () => {
    render(
      <Button variant="primary" size="md">
        Medium
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ minHeight: '44px', minWidth: '44px' });
  });

  it('applies size lg with larger tap target', () => {
    render(
      <Button variant="primary" size="lg">
        Large
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveStyle({ minHeight: '48px', minWidth: '48px' });
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" size="md" onClick={handleClick}>
        Click
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" size="md" onClick={handleClick} disabled>
        Disabled
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(
      <Button variant="primary" size="md" disabled>
        Disabled
      </Button>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows loading state and sets aria-busy', () => {
    render(
      <Button variant="primary" size="md" isLoading>
        Loading
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toBeDisabled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="primary" size="md" onClick={handleClick} isLoading>
        Loading
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders a loading spinner when isLoading is true', () => {
    render(
      <Button variant="primary" size="md" isLoading>
        Submit
      </Button>
    );
    const btn = screen.getByRole('button');
    const spinner = btn.querySelector('svg[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  it('hides children text visually during loading', () => {
    render(
      <Button variant="primary" size="md" isLoading>
        Submit
      </Button>
    );
    const btn = screen.getByRole('button');
    const textSpan = btn.querySelector('span');
    expect(textSpan).toHaveStyle({ visibility: 'hidden' });
  });

  it('renders fullWidth when prop is set', () => {
    render(
      <Button variant="primary" size="md" fullWidth>
        Full Width
      </Button>
    );
    expect(screen.getByRole('button')).toHaveStyle({ width: '100%' });
  });

  it('renders auto width by default', () => {
    render(
      <Button variant="primary" size="md">
        Normal
      </Button>
    );
    expect(screen.getByRole('button')).toHaveStyle({ width: 'auto' });
  });

  it('has type="button" to prevent form submission', () => {
    render(
      <Button variant="primary" size="md">
        Button
      </Button>
    );
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies focus-visible class for keyboard focus ring', () => {
    render(
      <Button variant="primary" size="md">
        Focus
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('btn-ui');
  });
});
