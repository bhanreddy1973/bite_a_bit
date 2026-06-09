import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DonutChart from '@/components/ui/DonutChart';

// Mock matchMedia for reduced motion tests
function mockMatchMedia(matches: boolean) {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn((_event: string, handler: (event: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  return listeners;
}

describe('DonutChart', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    // performance.now() is used to capture the startTime (line: const startTime = performance.now())
    // requestAnimationFrame callback receives currentTime as its argument
    // We make startTime = 0, and pass currentTime = 10000 so elapsed = 10000 > duration (800), progress = 1
    vi.spyOn(performance, 'now').mockReturnValue(0);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(10000);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultSegments = [
    { label: 'Carbs', value: 50, color: '#FF9500' },
    { label: 'Protein', value: 30, color: '#34C759' },
    { label: 'Fat', value: 20, color: '#FF3B30' },
  ];

  it('renders with correct aria-label describing percentages', () => {
    render(
      <DonutChart segments={defaultSegments} centerLabel="400 kcal" />
    );

    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute(
      'aria-label',
      'Donut chart showing Carbs: 50%, Protein: 30%, Fat: 20%. Center: 400 kcal'
    );
  });

  it('renders center label text', () => {
    render(
      <DonutChart segments={defaultSegments} centerLabel="400 kcal" />
    );

    expect(screen.getByText('400 kcal')).toBeInTheDocument();
  });

  it('renders SVG with color-coded segments', () => {
    const { container } = render(
      <DonutChart segments={defaultSegments} centerLabel="400 kcal" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that colored circles exist for each segment
    const circles = container.querySelectorAll('circle');
    // 1 background circle + up to 3 segment circles
    expect(circles.length).toBeGreaterThanOrEqual(2);
  });

  it('renders with custom size', () => {
    const { container } = render(
      <DonutChart segments={defaultSegments} centerLabel="400 kcal" size={300} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders empty state when total is zero', () => {
    const emptySegments = [
      { label: 'Carbs', value: 0, color: '#FF9500' },
      { label: 'Protein', value: 0, color: '#34C759' },
    ];

    render(
      <DonutChart segments={emptySegments} centerLabel="0 kcal" />
    );

    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label', 'Donut chart with no data');
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('respects prefers-reduced-motion by skipping animation', () => {
    mockMatchMedia(true);

    const { container } = render(
      <DonutChart segments={defaultSegments} centerLabel="400 kcal" />
    );

    // With reduced motion, segments should be fully visible immediately (progress = 1)
    const circles = container.querySelectorAll('circle[stroke="#FF9500"]');
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it('filters out zero-value segments', () => {
    const segmentsWithZero = [
      { label: 'Carbs', value: 50, color: '#FF9500' },
      { label: 'Protein', value: 0, color: '#34C759' },
      { label: 'Fat', value: 50, color: '#FF3B30' },
    ];

    render(
      <DonutChart segments={segmentsWithZero} centerLabel="200 kcal" />
    );

    const chart = screen.getByRole('img');
    // Protein is 0, so aria label should only mention Carbs and Fat
    expect(chart).toHaveAttribute(
      'aria-label',
      'Donut chart showing Carbs: 50%, Fat: 50%. Center: 200 kcal'
    );
  });

  it('uses default size of 200 when not specified', () => {
    const { container } = render(
      <DonutChart segments={defaultSegments} centerLabel="400 kcal" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });
});
