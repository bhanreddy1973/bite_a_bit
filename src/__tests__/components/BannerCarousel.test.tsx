import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BannerCarousel, type Banner } from '@/components/home/BannerCarousel';

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial,
      animate,
      exit,
      transition,
      drag,
      dragConstraints,
      dragElastic,
      onDragEnd,
      ...props
    }: React.ComponentProps<'div'> & {
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
      drag?: unknown;
      dragConstraints?: unknown;
      dragElastic?: unknown;
      onDragEnd?: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

const mockBanners: Banner[] = [
  { id: '1', imageUrl: '/banner1.jpg', altText: 'Banner One' },
  { id: '2', imageUrl: '/banner2.jpg', altText: 'Banner Two' },
  { id: '3', imageUrl: '/banner3.jpg', altText: 'Banner Three' },
];

describe('BannerCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when banners array is empty', () => {
    const { container } = render(<BannerCarousel banners={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders single banner statically (no dots, no carousel role)', () => {
    const singleBanner: Banner[] = [
      { id: '1', imageUrl: '/banner1.jpg', altText: 'Only Banner' },
    ];
    render(<BannerCarousel banners={singleBanner} />);

    expect(screen.getByAltText('Only Banner')).toBeInTheDocument();
    // Should not render dot indicators for single banner
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('renders carousel with multiple banners', () => {
    render(<BannerCarousel banners={mockBanners} />);

    // First banner should be visible
    expect(screen.getByAltText('Banner One')).toBeInTheDocument();
    // Dot indicators should be present
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders correct number of dot indicators', () => {
    render(<BannerCarousel banners={mockBanners} />);

    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(3);
  });

  it('marks the first dot as active initially', () => {
    render(<BannerCarousel banners={mockBanners} />);

    const dots = screen.getAllByRole('tab');
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
    expect(dots[1]).toHaveAttribute('aria-selected', 'false');
    expect(dots[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('auto-advances to next banner after 5 seconds', () => {
    render(<BannerCarousel banners={mockBanners} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Second dot should now be active
    const dots = screen.getAllByRole('tab');
    expect(dots[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('wraps around after the last banner', () => {
    render(<BannerCarousel banners={mockBanners} />);

    // Advance through all 3 banners (3 * 5s = 15s)
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    // Should wrap back to first
    const dots = screen.getAllByRole('tab');
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to specific banner when dot is clicked', () => {
    render(<BannerCarousel banners={mockBanners} />);

    const dots = screen.getAllByRole('tab');
    fireEvent.click(dots[2]);

    expect(dots[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('has proper carousel ARIA attributes', () => {
    render(<BannerCarousel banners={mockBanners} />);

    expect(screen.getByLabelText('Promotional banners')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Banner navigation')
    ).toBeInTheDocument();
  });

  it('dot indicators have accessible labels', () => {
    render(<BannerCarousel banners={mockBanners} />);

    expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to slide 3')).toBeInTheDocument();
  });

  it('does not auto-advance for single banner', () => {
    const singleBanner: Banner[] = [
      { id: '1', imageUrl: '/banner1.jpg', altText: 'Only Banner' },
    ];
    render(<BannerCarousel banners={singleBanner} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Still shows the same banner
    expect(screen.getByAltText('Only Banner')).toBeInTheDocument();
  });
});
