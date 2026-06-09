import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with a label associated to the input via htmlFor/id', () => {
    render(
      <Input label="Email" type="email" value="" onChange={() => {}} />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('calls onChange with the new value when user types', () => {
    const handleChange = vi.fn();
    render(
      <Input label="Name" type="text" value="" onChange={handleChange} />
    );

    const input = screen.getByLabelText('Name');
    fireEvent.change(input, { target: { value: 'John' } });
    expect(handleChange).toHaveBeenCalledWith('John');
  });

  it('shows the floating label when input has a value', () => {
    render(
      <Input label="Phone" type="tel" value="1234567890" onChange={() => {}} />
    );

    const label = screen.getByTestId('input-label');
    // When floating, font-size should be caption size (12px)
    expect(label.style.fontSize).toContain('12px');
  });

  it('shows the floating label when input is focused', () => {
    render(
      <Input label="Search" type="search" value="" onChange={() => {}} />
    );

    const input = screen.getByLabelText('Search');
    fireEvent.focus(input);

    const label = screen.getByTestId('input-label');
    // When floating, top should be 2px
    expect(label.style.top).toBe('2px');
  });

  it('displays error message and sets aria-invalid when error prop is provided', () => {
    render(
      <Input
        label="Phone"
        type="tel"
        value=""
        onChange={() => {}}
        error="Phone number is required"
      />
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('Phone number is required');

    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('does not show error message when error prop is undefined', () => {
    render(
      <Input label="Name" type="text" value="" onChange={() => {}} />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders a left icon when icon prop is provided', () => {
    const icon = <svg data-testid="search-icon" />;
    render(
      <Input
        label="Search"
        type="search"
        value=""
        onChange={() => {}}
        icon={icon}
      />
    );

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('input-icon')).toBeInTheDocument();
  });

  it('disables the input when disabled prop is true', () => {
    render(
      <Input
        label="Name"
        type="text"
        value=""
        onChange={() => {}}
        disabled={true}
      />
    );

    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
  });

  it('shows placeholder only when label is floating', () => {
    const { rerender } = render(
      <Input
        label="Name"
        type="text"
        value=""
        onChange={() => {}}
        placeholder="Enter your name"
      />
    );

    // Not focused, no value => label is not floating, placeholder hidden
    const input = screen.getByLabelText('Name');
    expect(input).not.toHaveAttribute('placeholder');

    // Focus the input => label floats, placeholder appears
    fireEvent.focus(input);
    rerender(
      <Input
        label="Name"
        type="text"
        value=""
        onChange={() => {}}
        placeholder="Enter your name"
      />
    );
    expect(screen.getByLabelText('Name')).toHaveAttribute(
      'placeholder',
      'Enter your name'
    );
  });

  it('applies error border color when error is present', () => {
    render(
      <Input
        label="Email"
        type="email"
        value=""
        onChange={() => {}}
        error="Invalid email"
      />
    );

    const container = screen.getByTestId('input-container');
    // The border style should contain the error color indicator
    const borderStyle = container.getAttribute('style') || '';
    expect(borderStyle).toContain('error');
  });

  it('applies focus ring when focused', () => {
    render(
      <Input label="Name" type="text" value="" onChange={() => {}} />
    );

    const input = screen.getByLabelText('Name');
    fireEvent.focus(input);

    const container = screen.getByTestId('input-container');
    expect(container.style.boxShadow).toBeTruthy();
  });

  it('supports all specified input types', () => {
    const types: Array<'text' | 'tel' | 'email' | 'search'> = [
      'text',
      'tel',
      'email',
      'search',
    ];

    types.forEach((type) => {
      const { unmount } = render(
        <Input label={`${type} input`} type={type} value="" onChange={() => {}} />
      );

      const input = screen.getByLabelText(`${type} input`);
      expect(input).toHaveAttribute('type', type);
      unmount();
    });
  });
});
