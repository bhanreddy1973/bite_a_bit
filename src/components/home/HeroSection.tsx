'use client';

import React from 'react';
import { QrCode } from 'lucide-react';

interface HeroSectionProps {
  restaurantName?: string;
}

/**
 * HeroSection displays the restaurant name and a QR scan prompt
 * when no restaurant is detected from URL parameters.
 */
export function HeroSection({ restaurantName }: HeroSectionProps) {
  const displayName = restaurantName || 'bbq_in';
  const hasRestaurantFromUrl = Boolean(restaurantName);

  return (
    <section className="hero-section" aria-label="Restaurant welcome">
      <h1 className="hero-section__title">{displayName}</h1>
      {!hasRestaurantFromUrl && (
        <div className="hero-section__qr-prompt" role="status">
          <QrCode size={24} aria-hidden="true" />
          <p className="hero-section__qr-text">Scan a QR code at your restaurant to get started</p>
        </div>
      )}
    </section>
  );
}

export default HeroSection;
