import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card variant="elevated">Hello Card</Card>);
    expect(screen.getByText('Hello Card')).toBeInTheDocument();
  });

  it('applies border-radius via inline style for elevated variant', () => {
    render(<Card variant="elevated">Content</Card>);
    const card = screen.getByText('Content').closest('div')!;
    expect(card.style.borderRadius).toBe('var(--radius-lg)');
  });

  it('applies no box-shadow for flat variant', () => {
    render(<Card variant="flat">Content</Card>);
    const card = screen.getByText('Content').closest('div')!;
    expect(card.style.boxShadow).toBe('none');
  });

  it('applies backdrop-blur for glass variant', () => {
    render(<Card variant="glass">Glass Content</Card>);
    const card = screen.getByText('Glass Content').closest('div')!;
    expect(card.style.backdropFilter).toBe('blur(12px)');
  });

  it('applies correct padding for sm', () => {
    render(<Card variant="elevated" padding="sm">Padded</Card>);
    const card = screen.getByText('Padded').closest('div')!;
    expect(card.style.padding).toBe('var(--space-3)');
  });

  it('applies correct padding for lg', () => {
    render(<Card variant="elevated" padding="lg">Padded</Card>);
    const card = screen.getByText('Padded').closest('div')!;
    expect(card.style.padding).toBe('var(--space-6)');
  });

  it('defaults to md padding', () => {
    render(<Card variant="elevated">Default Padding</Card>);
    const card = screen.getByText('Default Padding').closest('div')!;
    expect(card.style.padding).toBe('var(--space-4)');
  });

  it('sets role="button" and tabIndex when pressable', () => {
    render(<Card variant="elevated" pressable>Pressable Card</Card>);
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('does not set role or tabIndex when not pressable', () => {
    render(<Card variant="elevated">Non-pressable</Card>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClick when pressable card is clicked', () => {
    const handleClick = vi.fn();
    render(<Card variant="elevated" pressable onClick={handleClick}>Click Me</Card>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Enter key when pressable', () => {
    const handleClick = vi.fn();
    render(<Card variant="elevated" pressable onClick={handleClick}>Key Press</Card>);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Space key when pressable', () => {
    const handleClick = vi.fn();
    render(<Card variant="elevated" pressable onClick={handleClick}>Space Press</Card>);
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when not pressable', () => {
    const handleClick = vi.fn();
    render(<Card variant="flat" onClick={handleClick}>No Click</Card>);
    const card = screen.getByText('No Click').closest('div')!;
    fireEvent.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('sets cursor to pointer when pressable', () => {
    render(<Card variant="elevated" pressable>Pointer</Card>);
    const card = screen.getByRole('button');
    expect(card.style.cursor).toBe('pointer');
  });

  it('sets cursor to default when not pressable', () => {
    render(<Card variant="elevated">Default Cursor</Card>);
    const card = screen.getByText('Default Cursor').closest('div')!;
    expect(card.style.cursor).toBe('default');
  });
});
