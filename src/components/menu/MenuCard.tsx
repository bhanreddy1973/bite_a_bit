'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { Badge } from '@/components/ui/Badge';

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  isInCart: boolean;
  cartQuantity: number;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onExpand: (item: MenuItem) => void;
}

const dietVariantMap: Record<MenuItem['diet'], 'vegetarian' | 'non-vegetarian' | 'vegan'> = {
  Vegetarian: 'vegetarian',
  'Non-Vegetarian': 'non-vegetarian',
  Vegan: 'vegan',
};

const MenuCardComponent: React.FC<MenuCardProps> = ({
  item,
  onAdd,
  isInCart,
  cartQuantity,
  onIncrease,
  onDecrease,
  onExpand,
}) => {
  const isUnavailable = !item.available;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUnavailable) {
      onAdd(item);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIncrease(item.id);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecrease(item.id);
  };

  const handleExpand = () => {
    if (!isUnavailable) {
      onExpand(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExpand();
    }
  };

  return (
    <motion.div
      style={{
        ...cardStyles,
        opacity: isUnavailable ? 0.5 : 1,
        cursor: isUnavailable ? 'not-allowed' : 'pointer',
      }}
      whileTap={isUnavailable ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleExpand}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isUnavailable ? -1 : 0}
      aria-label={`${item.name}, ₹${item.price}, ${item.diet}${isUnavailable ? ', unavailable' : ''}`}
      aria-disabled={isUnavailable}
    >
      {/* Image */}
      <div style={imageContainerStyles}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB4QAAICAgIDAAAAAAAAAAAAAAECAAMEIRESBTFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQADAQEAAAAAAAAAAAAAAAAAAQIRIf/aAAwDAQACEQMRAD8AqcXx+NkZVdduRYlbOFZlUEgE6J0dfsx/Zf/Z"
          />
        ) : (
          <div style={placeholderImageStyles}>
            <span style={{ fontSize: 'var(--font-size-display)', opacity: 0.3 }}>🍽️</span>
          </div>
        )}
        {/* Diet Badge */}
        <div style={badgePositionStyles}>
          <Badge variant={dietVariantMap[item.diet]}>{item.diet}</Badge>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyles}>
        {/* Name */}
        <h3 style={nameStyles}>{item.name}</h3>

        {/* Rating and Prep Time */}
        <div style={metaRowStyles}>
          <span style={ratingStyles}>
            <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
            <span>{item.rating.toFixed(1)}</span>
          </span>
          <span style={prepTimeStyles}>
            <Clock size={12} />
            <span>{item.prep_time}</span>
          </span>
        </div>

        {/* Price and Action */}
        <div style={footerStyles}>
          <span style={priceStyles}>₹{item.price}</span>

          {isUnavailable ? (
            <span style={unavailableTextStyles}>Unavailable</span>
          ) : isInCart ? (
            <div style={quantityStepperStyles}>
              <button
                onClick={handleDecrease}
                style={stepperButtonStyles}
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus size={14} />
              </button>
              <span style={quantityTextStyles} aria-live="polite">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncrease}
                style={stepperButtonStyles}
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              style={addButtonStyles}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Styles
const cardStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-surface-elevated)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid var(--color-border-light)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow var(--transition-fast)',
};

const imageContainerStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '140px',
  backgroundColor: 'var(--color-bg-tertiary)',
};

const placeholderImageStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-bg-secondary)',
};

const badgePositionStyles: React.CSSProperties = {
  position: 'absolute',
  top: 'var(--space-2)',
  left: 'var(--space-2)',
};

const contentStyles: React.CSSProperties = {
  padding: 'var(--space-3)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  flex: 1,
};

const nameStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-primary)',
  lineHeight: 'var(--line-height-tight)',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaRowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)',
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-text-secondary)',
};

const ratingStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
};

const prepTimeStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  color: 'var(--color-text-tertiary)',
};

const footerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 'auto',
};

const priceStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
};

const unavailableTextStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-error)',
  fontWeight: 'var(--font-weight-medium)',
};

const addButtonStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: 'var(--space-1) var(--space-3)',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-inverse)',
  border: 'none',
  borderRadius: 'var(--radius-pill)',
  fontSize: 'var(--font-size-caption)',
  fontWeight: 'var(--font-weight-semibold)',
  cursor: 'pointer',
  minHeight: '32px',
  minWidth: '44px',
  justifyContent: 'center',
};

const quantityStepperStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
  backgroundColor: 'var(--color-primary-light)',
  borderRadius: 'var(--radius-pill)',
  padding: 'var(--space-1) var(--space-2)',
};

const stepperButtonStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-inverse)',
  cursor: 'pointer',
  minWidth: '28px',
  minHeight: '28px',
};

const quantityTextStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-primary)',
  minWidth: '20px',
  textAlign: 'center',
};

export const MenuCard = React.memo(MenuCardComponent);
export default MenuCard;
