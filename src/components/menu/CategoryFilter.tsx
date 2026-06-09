'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) {
  return (
    <div className="category-filter" role="tablist" aria-label="Category filter">
      <div className="category-filter__scroll">
        <button
          role="tab"
          aria-selected={selectedCategory === null}
          className={`category-filter__pill ${selectedCategory === null ? 'category-filter__pill--active' : ''}`}
          onClick={() => onCategorySelect(null)}
          type="button"
        >
          All
          {selectedCategory === null && (
            <motion.span
              className="category-filter__indicator"
              layoutId="category-indicator"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            role="tab"
            aria-selected={selectedCategory === category}
            className={`category-filter__pill ${selectedCategory === category ? 'category-filter__pill--active' : ''}`}
            onClick={() => onCategorySelect(category)}
            type="button"
          >
            {category}
            {selectedCategory === category && (
              <motion.span
                className="category-filter__indicator"
                layoutId="category-indicator"
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
