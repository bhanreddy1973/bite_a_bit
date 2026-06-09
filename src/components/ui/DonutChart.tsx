'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  size?: number;
}

function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export default function DonutChart({ segments, centerLabel, size = 200 }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const animationRef = useRef<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const total = useMemo(() => segments.reduce((sum, seg) => sum + seg.value, 0), [segments]);

  const segmentData = useMemo(() => {
    if (total === 0) return [];

    let cumulativeOffset = 0;
    return segments
      .filter((seg) => seg.value > 0)
      .map((seg) => {
        const percentage = (seg.value / total) * 100;
        const offset = cumulativeOffset;
        cumulativeOffset += percentage;
        return {
          ...seg,
          percentage,
          offset,
        };
      });
  }, [segments, total]);

  const ariaLabel = useMemo(() => {
    if (total === 0) return 'Donut chart with no data';
    const descriptions = segmentData.map((seg) => `${seg.label}: ${Math.round(seg.percentage)}%`);
    return `Donut chart showing ${descriptions.join(', ')}. Center: ${centerLabel}`;
  }, [segmentData, centerLabel, total]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || prefersReducedMotion) {
      setAnimationProgress(1);
      return;
    }

    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, prefersReducedMotion]);

  const strokeWidth = size * 0.15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (total === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label="Donut chart with no data"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-border-light)"
            strokeWidth={strokeWidth}
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-tertiary)"
            fontSize={size * 0.08}
            fontFamily="var(--font-family)"
          >
            No data
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block',
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border-light)"
          strokeWidth={strokeWidth}
        />

        {/* Animated segments */}
        {segmentData.map((seg, index) => {
          const segmentLength = (seg.percentage / 100) * circumference;
          const segmentOffset = (seg.offset / 100) * circumference;

          // Calculate how much of this segment should be visible based on animation progress
          const totalAnimatedLength = animationProgress * circumference;
          const visibleLength = Math.max(
            0,
            Math.min(segmentLength, totalAnimatedLength - segmentOffset),
          );

          if (visibleLength <= 0) return null;

          return (
            <circle
              key={`${seg.label}-${index}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${visibleLength} ${circumference - visibleLength}`}
              strokeDashoffset={-segmentOffset}
              strokeLinecap="butt"
              style={{
                transition: prefersReducedMotion ? 'none' : undefined,
              }}
            />
          );
        })}
      </svg>

      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: size * 0.14,
            fontWeight: 'var(--font-weight-bold)' as unknown as number,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {centerLabel}
        </span>
      </div>
    </div>
  );
}
