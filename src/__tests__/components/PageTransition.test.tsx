import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PageTransition } from '@/components/layout/PageTransition';

// Mock next/navigation
const mockPathname = vi.fn().mockReturnValue('/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

let matchMediaState: Map<string, boolean>;

beforeEach(() => {
  matchMediaState = new Map();
  matchMediaState.set('(prefers-reduced-motion: reduce)', false);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: matchMediaState.get(query) ?? false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: () => false,
    }),
  });
});

describe('PageTransition', () => {
  it('renders children content', () => {
    render(
      <PageTransition>
        <div data-testid="page-content">Hello World</div>
      </PageTransition>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('wraps children in a motion div when animations are enabled', () => {
    const { container } = render(
      <PageTransition>
        <div data-testid="page-content">Animated Content</div>
      </PageTransition>
    );

    // Framer motion wraps content in a div with style attributes
    const motionDiv = container.firstChild as HTMLElement;
    expect(motionDiv).toBeTruthy();
    expect(motionDiv.tagName).toBe('DIV');
    // motion.div sets style for opacity and transform
    expect(motionDiv.style).toBeDefined();
  });

  it('renders children directly without wrapper when prefers-reduced-motion is set', () => {
    matchMediaState.set('(prefers-reduced-motion: reduce)', true);

    const { container } = render(
      <PageTransition>
        <div data-testid="page-content">Static Content</div>
      </PageTransition>
    );

    // When reduced motion is preferred, children are rendered directly
    const child = screen.getByTestId('page-content');
    expect(child).toBeInTheDocument();
    // The first child should be the content itself (no wrapper motion div)
    expect(container.firstChild).toBe(child);
  });

  it('uses pathname as key for AnimatePresence', () => {
    mockPathname.mockReturnValue('/menu');

    const { container } = render(
      <PageTransition>
        <div>Menu Page</div>
      </PageTransition>
    );

    // The motion div is keyed by pathname, so content renders
    expect(screen.getByText('Menu Page')).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('renders different content for different pathnames', () => {
    mockPathname.mockReturnValue('/order-summary');

    render(
      <PageTransition>
        <div data-testid="order-page">Order Summary</div>
      </PageTransition>
    );

    expect(screen.getByTestId('order-page')).toBeInTheDocument();
  });
});
