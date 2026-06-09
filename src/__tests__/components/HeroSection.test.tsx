import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroSection } from '@/components/home/HeroSection';

describe('HeroSection', () => {
  it('displays the restaurant name when provided', () => {
    render(<HeroSection restaurantName="Pizza Palace" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pizza Palace');
  });

  it('displays "bbq_in" as default when no restaurant name is provided', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('bbq_in');
  });

  it('displays "bbq_in" as default when restaurant name is undefined', () => {
    render(<HeroSection restaurantName={undefined} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('bbq_in');
  });

  it('shows QR scan prompt when no restaurant name is detected from URL', () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/scan a qr code at your restaurant/i)
    ).toBeInTheDocument();
  });

  it('does not show QR scan prompt when restaurant name is provided', () => {
    render(<HeroSection restaurantName="Pizza Palace" />);
    expect(
      screen.queryByText(/scan a qr code at your restaurant/i)
    ).not.toBeInTheDocument();
  });

  it('renders with proper ARIA landmark', () => {
    render(<HeroSection />);
    expect(screen.getByLabelText('Restaurant welcome')).toBeInTheDocument();
  });
});
