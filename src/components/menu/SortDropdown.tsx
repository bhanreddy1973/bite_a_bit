'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'price-low-high' | 'price-high-low' | 'rating' | 'prep-time';

export interface SortDropdownProps {
  sortOption: string;
  onSortChange: (option: string) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'prep-time', label: 'Prep Time' },
];

export function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Sort by';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard support
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const currentIndex = SORT_OPTIONS.findIndex((opt) => opt.value === sortOption);
          const nextIndex = Math.min(currentIndex + 1, SORT_OPTIONS.length - 1);
          onSortChange(SORT_OPTIONS[nextIndex].value);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          const currentIndex = SORT_OPTIONS.findIndex((opt) => opt.value === sortOption);
          const prevIndex = Math.max(currentIndex - 1, 0);
          onSortChange(SORT_OPTIONS[prevIndex].value);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          triggerRef.current?.focus();
        } else {
          setIsOpen(true);
        }
        break;
    }
  };

  const handleOptionSelect = (value: string) => {
    onSortChange(value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="sort-dropdown" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className="sort-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Sort by: ${selectedLabel}`}
      >
        <span className="sort-dropdown__label">{selectedLabel}</span>
        <motion.span
          className="sort-dropdown__chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="sort-dropdown__menu"
            role="listbox"
            aria-label="Sort options"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {SORT_OPTIONS.map((option) => (
              <motion.li
                key={option.value}
                role="option"
                aria-selected={sortOption === option.value}
                className={`sort-dropdown__option ${
                  sortOption === option.value ? 'sort-dropdown__option--active' : ''
                }`}
                onClick={() => handleOptionSelect(option.value)}
                layout
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {option.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
