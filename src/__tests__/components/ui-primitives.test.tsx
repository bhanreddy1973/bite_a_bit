import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { IconButton } from '../../components/ui/IconButton';

describe('Badge', () => {
  it('renders children content', () => {
    render(<Badge>Vegan</Badge>);
    expect(screen.getByText('Vegan')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge).toBeInTheDocument();
  });

  it('renders cart variant with aria-label for accessibility', () => {
    render(<Badge variant="cart">3</Badge>);
    const badge = screen.getByLabelText('3 items in cart');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('renders vegetarian variant', () => {
    render(<Badge variant="vegetarian">Veg</Badge>);
    expect(screen.getByText('Veg')).toBeInTheDocument();
  });

  it('renders non-vegetarian variant', () => {
    render(<Badge variant="non-vegetarian">Non-Veg</Badge>);
    expect(screen.getByText('Non-Veg')).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders with text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders multiple text lines when count > 1', () => {
    const { container } = render(<Skeleton variant="text" count={3} />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBe(3);
  });

  it('renders circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toHaveStyle({ borderRadius: '50%' });
  });

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders card variant', () => {
    const { container } = render(<Skeleton variant="card" />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('accepts custom width and height', () => {
    const { container } = render(<Skeleton variant="rectangular" width={200} height={100} />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('has role="presentation" for accessibility', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('[role="presentation"]');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('IconButton', () => {
  it('renders with required aria-label', () => {
    render(
      <IconButton aria-label="Close menu" icon={<span>X</span>} />
    );
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('has minimum 44x44px touch target', () => {
    render(
      <IconButton aria-label="Settings" icon={<span>⚙</span>} />
    );
    const button = screen.getByLabelText('Settings');
    expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <IconButton aria-label="Delete" icon={<span>🗑</span>} onClick={handleClick} />
    );
    fireEvent.click(screen.getByLabelText('Delete'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <IconButton aria-label="Disabled" icon={<span>X</span>} disabled />
    );
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  it('renders with different size variants maintaining 44px minimum', () => {
    render(
      <IconButton aria-label="Small" icon={<span>S</span>} size="sm" />
    );
    const button = screen.getByLabelText('Small');
    expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
  });
});
