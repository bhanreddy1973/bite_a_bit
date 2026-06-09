'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';

export interface Banner {
  id: string;
  imageUrl: string;
  altText: string;
}

interface BannerCarouselProps {
  banners: Banner[];
}

const AUTOPLAY_INTERVAL = 5000; // 5 seconds
const CROSSFADE_DURATION = 0.7; // 700ms max
const SWIPE_THRESHOLD = 50; // pixels to trigger swipe navigation

/**
 * BannerCarousel displays promotional banners with auto-advance,
 * crossfade transitions, dot indicators, and swipe gesture support.
 * If fewer than 2 banners, displays a single banner statically.
 */
export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasMultipleBanners = banners.length >= 2;

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Reset interval when user interacts
  const resetAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (hasMultipleBanners) {
      intervalRef.current = setInterval(goToNext, AUTOPLAY_INTERVAL);
    }
  }, [goToNext, hasMultipleBanners]);

  // Auto-advance every 5s
  useEffect(() => {
    if (!hasMultipleBanners) return;

    intervalRef.current = setInterval(goToNext, AUTOPLAY_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [goToNext, hasMultipleBanners]);

  // Handle swipe gestures
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset } = info;
      if (offset.x < -SWIPE_THRESHOLD) {
        goToNext();
        resetAutoplay();
      } else if (offset.x > SWIPE_THRESHOLD) {
        goToPrev();
        resetAutoplay();
      }
    },
    [goToNext, goToPrev, resetAutoplay],
  );

  // Handle dot indicator click
  const handleDotClick = useCallback(
    (index: number) => {
      goToIndex(index);
      resetAutoplay();
    },
    [goToIndex, resetAutoplay],
  );

  if (banners.length === 0) {
    return null;
  }

  // Static display for fewer than 2 banners
  if (!hasMultipleBanners) {
    return (
      <div className="banner-carousel" aria-label="Promotional banner">
        <div className="banner-carousel__slide">
          <img
            src={banners[0].imageUrl}
            alt={banners[0].altText}
            className="banner-carousel__image"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="banner-carousel"
      aria-label="Promotional banners"
      aria-roledescription="carousel"
    >
      <div className="banner-carousel__viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={banners[activeIndex].id}
            className="banner-carousel__slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: CROSSFADE_DURATION, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${activeIndex + 1} of ${banners.length}`}
          >
            <img
              src={banners[activeIndex].imageUrl}
              alt={banners[activeIndex].altText}
              className="banner-carousel__image"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="banner-carousel__dots" role="tablist" aria-label="Banner navigation">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            className={`banner-carousel__dot ${
              index === activeIndex ? 'banner-carousel__dot--active' : ''
            }`}
            onClick={() => handleDotClick(index)}
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default BannerCarousel;
