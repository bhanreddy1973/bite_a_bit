import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CategoryFilter } from '@/components/menu/CategoryFilter';
import { SearchBar } from '@/components/menu/SearchBar';
import { SortDropdown } from '@/components/menu/SortDropdown';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, onClick, className, role, ...props }: any) => (
      <li onClick={onClick} className={className} role={role} aria-selected={props['aria-selected']}>
        {children}
      </li>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CategoryFilter', () => {
  const categories = ['Pizza', 'Burgers', 'Sushi', 'Desserts'];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders "All" button and all categories', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory={null}
        onCategorySelect={mockOnSelect}
      />
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    categories.forEach((cat) => {
      expect(screen.getByText(cat)).toBeInTheDocument();
    });
  });

  it('marks "All" as active when selectedCategory is null', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory={null}
        onCategorySelect={mockOnSelect}
      />
    );

    const allButton = screen.getByText('All');
    expect(allButton).toHaveAttribute('aria-selected', 'true');
  });

  it('marks the correct category as active', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="Pizza"
        onCategorySelect={mockOnSelect}
      />
    );

    const pizzaButton = screen.getByText('Pizza');
    expect(pizzaButton).toHaveAttribute('aria-selected', 'true');

    const allButton = screen.getByText('All');
    expect(allButton).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onCategorySelect with category when clicked', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory={null}
        onCategorySelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('Burgers'));
    expect(mockOnSelect).toHaveBeenCalledWith('Burgers');
  });

  it('calls onCategorySelect with null when "All" is clicked', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory="Pizza"
        onCategorySelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('All'));
    expect(mockOnSelect).toHaveBeenCalledWith(null);
  });

  it('has proper accessibility attributes', () => {
    render(
      <CategoryFilter
        categories={categories}
        selectedCategory={null}
        onCategorySelect={mockOnSelect}
      />
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Category filter');

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(categories.length + 1); // +1 for "All"
  });
});

describe('SearchBar', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with search icon and input', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search menu items...')).toBeInTheDocument();
  });

  it('debounces input changes with 300ms delay', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    fireEvent.change(input, { target: { value: 'pizza' } });

    // Should not call onChange immediately
    expect(mockOnChange).not.toHaveBeenCalledWith('pizza');

    // Advance time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockOnChange).toHaveBeenCalledWith('pizza');
  });

  it('shows clear button when input has value', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search menu items...');

    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'test' } });

    // Clear button should appear
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears input and fires onChange immediately when clear is clicked', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  it('has proper search role and accessibility', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
  });
});

describe('SortDropdown', () => {
  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    mockOnSortChange.mockClear();
  });

  it('renders with the selected sort option label', () => {
    render(
      <SortDropdown sortOption="price-low-high" onSortChange={mockOnSortChange} />
    );

    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
  });

  it('shows "Sort by" when no matching option', () => {
    render(
      <SortDropdown sortOption="" onSortChange={mockOnSortChange} />
    );

    expect(screen.getByText('Sort by')).toBeInTheDocument();
  });

  it('opens dropdown menu on click', () => {
    render(
      <SortDropdown sortOption="rating" onSortChange={mockOnSortChange} />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
    expect(screen.getByText('Prep Time')).toBeInTheDocument();
  });

  it('calls onSortChange when an option is selected', () => {
    render(
      <SortDropdown sortOption="rating" onSortChange={mockOnSortChange} />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    fireEvent.click(screen.getByText('Price: High to Low'));
    expect(mockOnSortChange).toHaveBeenCalledWith('price-high-low');
  });

  it('closes dropdown after selection', () => {
    render(
      <SortDropdown sortOption="rating" onSortChange={mockOnSortChange} />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    fireEvent.click(screen.getByText('Price: High to Low'));

    // Menu should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('has proper aria attributes for accessibility', () => {
    render(
      <SortDropdown sortOption="rating" onSortChange={mockOnSortChange} />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape key', () => {
    render(
      <SortDropdown sortOption="rating" onSortChange={mockOnSortChange} />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger.closest('.sort-dropdown')!, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks active option with aria-selected', () => {
    render(
      <SortDropdown sortOption="rating" onSortChange={mockOnSortChange} />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    const ratingOption = options.find((opt) => opt.textContent === 'Rating');
    expect(ratingOption).toHaveAttribute('aria-selected', 'true');
  });
});
