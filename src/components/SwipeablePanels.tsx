import React, { useRef, useState, useEffect } from 'react';

interface SwipeablePanelsProps {
  children: React.ReactNode[];
  initialIndex?: number;
  style?: React.CSSProperties;
  onPanelChange?: (index: number) => void;
  currentIndex?: number;
}

const SWIPE_THRESHOLD = 50; // px
const ANIMATION_DURATION = 400; // ms

const SwipeablePanels: React.FC<SwipeablePanelsProps> = ({
  children,
  initialIndex = 0,
  style = {},
  onPanelChange,
  currentIndex,
}) => {
  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const activeIndex = typeof currentIndex === 'number' ? currentIndex : internalIndex;
  const [offset, setOffset] = useState(0); // px
  const [isDragging, setIsDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const startX = useRef<number | null>(null);
  const lastOffset = useRef(0);

  const panelCount = children.length;

  // Get window width on client side
  useEffect(() => {
    const updateWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Touch/mouse event handlers
  const onStart = (clientX: number) => {
    console.log('Touch/Mouse start:', clientX);
    if (animating) return;
    setIsDragging(true);
    startX.current = clientX;
    lastOffset.current = 0;
  };

  const onMove = (clientX: number) => {
    if (!isDragging || animating || startX.current === null) return;
    const delta = clientX - startX.current;
    console.log('Touch/Mouse move:', { clientX, delta });
    setOffset(delta);
    lastOffset.current = delta;
  };

  const onEnd = () => {
    console.log('Touch/Mouse end:', { lastOffset: lastOffset.current, activeIndex });
    if (!isDragging || animating) return;
    setIsDragging(false);
    let newIndex = activeIndex;
    if (lastOffset.current > SWIPE_THRESHOLD && activeIndex > 0) {
      newIndex = activeIndex - 1;
    } else if (lastOffset.current < -SWIPE_THRESHOLD && activeIndex < panelCount - 1) {
      newIndex = activeIndex + 1;
    }
    setAnimating(true);
    setOffset((newIndex - activeIndex) * -windowWidth);
    setTimeout(() => {
      if (typeof currentIndex !== 'number') setInternalIndex(newIndex);
      setOffset(0);
      setAnimating(false);
      if (onPanelChange) {
        onPanelChange(newIndex);
      }
    }, ANIMATION_DURATION);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    onStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    onMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    onEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onStart(e.clientX);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e: MouseEvent) => {
    onMove(e.clientX);
  };
  const handleMouseUp = () => {
    onEnd();
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Calculate translateX
  const translateX = -activeIndex * windowWidth + offset;

  // Don't render until we have window width
  if (windowWidth === 0) {
    return <div style={{ ...style, padding: '20px', textAlign: 'center' }}>Loading panels...</div>;
  }

  console.log('SwipeablePanels render:', { 
    activeIndex, 
    offset, 
    isDragging, 
    windowWidth, 
    translateX, 
    panelCount 
  });

  return (
    <div
      style={{
        overflow: 'hidden',
        width: '100vw',
        touchAction: 'pan-y',
        ...style,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          display: 'flex',
          transition: animating ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.22,1,0.36,1)` : 'none',
          transform: `translateX(${translateX}px)`,
          width: `${panelCount * windowWidth}px`,
        }}
      >
        {children.map((child, idx) => (
          <div key={idx} style={{ width: '100vw', flexShrink: 0 }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeablePanels; 