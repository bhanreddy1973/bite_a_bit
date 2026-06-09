'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Flame, Users, Utensils } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { Badge } from '@/components/ui/Badge';

interface MenuCardExpandedProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const dietVariantMap: Record<MenuItem['diet'], 'vegetarian' | 'non-vegetarian' | 'vegan'> = {
  Vegetarian: 'vegetarian',
  'Non-Vegetarian': 'non-vegetarian',
  Vegan: 'vegan',
};

const MenuCardExpanded: React.FC<MenuCardExpandedProps> = ({ item, isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus the close button when overlay opens
    closeButtonRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={overlayStyles}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${item.name}`}
        >
          <motion.div
            ref={dialogRef}
            style={dialogStyles}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              style={closeButtonStyles}
              aria-label="Close details"
            >
              <X size={20} />
            </button>

            {/* Header Image */}
            <div style={headerImageStyles}>
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB4QAAICAgIDAAAAAAAAAAAAAAECAAMEIRESBTFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQADAQEAAAAAAAAAAAAAAAAAAQIRIf/aAAwDAQACEQMRAD8AqcXx+NkZVdduRYlbOFZlUEgE6J0dfsx/Zf/Z"
                />
              ) : (
                <div style={placeholderStyles}>
                  <span style={{ fontSize: '48px', opacity: 0.3 }}>🍽️</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div style={contentWrapperStyles}>
              {/* Title and Badge Row */}
              <div style={titleRowStyles}>
                <h2 style={titleStyles}>{item.name}</h2>
                <Badge variant={dietVariantMap[item.diet]}>{item.diet}</Badge>
              </div>

              {/* Meta Info Row */}
              <div style={metaStyles}>
                <span style={metaItemStyles}>
                  <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
                  {item.rating.toFixed(1)} ({item.review_count} reviews)
                </span>
                <span style={metaItemStyles}>
                  <Clock size={14} />
                  {item.prep_time}
                </span>
                <span style={metaItemStyles}>
                  <Flame size={14} />
                  {item.spice_level}
                </span>
                <span style={metaItemStyles}>
                  <Users size={14} />
                  Serves {item.serves}
                </span>
              </div>

              {/* Price */}
              <p style={expandedPriceStyles}>₹{item.price}</p>

              {/* Description */}
              <div style={sectionStyles}>
                <h3 style={sectionTitleStyles}>Description</h3>
                <p style={sectionTextStyles}>{item.description}</p>
              </div>

              {/* Ingredients */}
              {item.ingredients.length > 0 && (
                <div style={sectionStyles}>
                  <h3 style={sectionTitleStyles}>
                    <Utensils size={14} style={{ marginRight: '6px' }} />
                    Ingredients
                  </h3>
                  <div style={tagContainerStyles}>
                    {item.ingredients.map((ingredient) => (
                      <span key={ingredient} style={tagStyles}>
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {item.allergens.length > 0 && (
                <div style={sectionStyles}>
                  <h3 style={{ ...sectionTitleStyles, color: 'var(--color-error)' }}>
                    ⚠️ Allergens
                  </h3>
                  <div style={tagContainerStyles}>
                    {item.allergens.map((allergen) => (
                      <span key={allergen} style={allergenTagStyles}>
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutritional Info */}
              <div style={sectionStyles}>
                <h3 style={sectionTitleStyles}>Nutritional Info</h3>
                <div style={nutritionGridStyles}>
                  <div style={nutritionItemStyles}>
                    <span style={nutritionValueStyles}>{item.calories}</span>
                    <span style={nutritionLabelStyles}>Calories</span>
                  </div>
                  <div style={nutritionItemStyles}>
                    <span style={nutritionValueStyles}>{item.carbs}g</span>
                    <span style={nutritionLabelStyles}>Carbs</span>
                  </div>
                  <div style={nutritionItemStyles}>
                    <span style={nutritionValueStyles}>{item.protein}g</span>
                    <span style={nutritionLabelStyles}>Protein</span>
                  </div>
                  <div style={nutritionItemStyles}>
                    <span style={nutritionValueStyles}>{item.fat}g</span>
                    <span style={nutritionLabelStyles}>Fat</span>
                  </div>
                </div>
              </div>

              {/* Pairing Suggestions */}
              {item.pairs_well_with.length > 0 && (
                <div style={sectionStyles}>
                  <h3 style={sectionTitleStyles}>Pairs Well With</h3>
                  <div style={tagContainerStyles}>
                    {item.pairs_well_with.map((pairing) => (
                      <span key={pairing} style={pairingTagStyles}>
                        {pairing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 'var(--space-4)',
};

const dialogStyles: React.CSSProperties = {
  position: 'relative',
  backgroundColor: 'var(--color-surface-elevated)',
  borderRadius: 'var(--radius-xl)',
  maxWidth: '480px',
  width: '100%',
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: 'var(--shadow-xl)',
};

const closeButtonStyles: React.CSSProperties = {
  position: 'absolute',
  top: 'var(--space-3)',
  right: 'var(--space-3)',
  zIndex: 10,
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  minWidth: '44px',
  minHeight: '44px',
};

const headerImageStyles: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '200px',
  backgroundColor: 'var(--color-bg-tertiary)',
};

const placeholderStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-bg-secondary)',
};

const contentWrapperStyles: React.CSSProperties = {
  padding: 'var(--space-5)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
};

const titleRowStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--space-3)',
};

const titleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-title)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
  margin: 0,
  lineHeight: 'var(--line-height-tight)',
};

const metaStyles: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-3)',
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-text-secondary)',
};

const metaItemStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const expandedPriceStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-heading)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-primary)',
  margin: 0,
};

const sectionStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-label)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
};

const sectionTextStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  color: 'var(--color-text-primary)',
  lineHeight: 'var(--line-height-relaxed)',
  margin: 0,
};

const tagContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-2)',
};

const tagStyles: React.CSSProperties = {
  display: 'inline-block',
  padding: 'var(--space-1) var(--space-2)',
  backgroundColor: 'var(--color-bg-secondary)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-text-secondary)',
};

const allergenTagStyles: React.CSSProperties = {
  display: 'inline-block',
  padding: 'var(--space-1) var(--space-2)',
  backgroundColor: '#FFEBEE',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-size-caption)',
  color: '#C62828',
  fontWeight: 'var(--font-weight-medium)',
};

const nutritionGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--space-2)',
};

const nutritionItemStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'var(--space-3)',
  backgroundColor: 'var(--color-bg-secondary)',
  borderRadius: 'var(--radius-md)',
  gap: '2px',
};

const nutritionValueStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
};

const nutritionLabelStyles: React.CSSProperties = {
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-text-tertiary)',
};

const pairingTagStyles: React.CSSProperties = {
  display: 'inline-block',
  padding: 'var(--space-1) var(--space-3)',
  backgroundColor: 'var(--color-primary-light)',
  borderRadius: 'var(--radius-pill)',
  fontSize: 'var(--font-size-caption)',
  color: 'var(--color-primary)',
  fontWeight: 'var(--font-weight-medium)',
};

export default MenuCardExpanded;
