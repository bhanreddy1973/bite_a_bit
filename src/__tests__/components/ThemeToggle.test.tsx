import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUIStore } from '@/stores/uiStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useUIStore.setState({
      theme: 'light',
      resolvedTheme: 'light',
    });
  });

  it('renders with accessible label "Switch to dark mode" when in light mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with accessible label "Switch to light mode" when in dark mode', () => {
    useUIStore.setState({ theme: 'dark', resolvedTheme: 'dark' });
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it('toggles from light to dark on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(useUIStore.getState().theme).toBe('dark');
    expect(useUIStore.getState().resolvedTheme).toBe('dark');
  });

  it('toggles from dark to light on click', () => {
    useUIStore.setState({ theme: 'dark', resolvedTheme: 'dark' });
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(useUIStore.getState().theme).toBe('light');
    expect(useUIStore.getState().resolvedTheme).toBe('light');
  });

  it('toggles from system to the opposite of resolved theme', () => {
    useUIStore.setState({ theme: 'system', resolvedTheme: 'light' });
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('activates on Enter key press', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('activates on Space key press', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('does not activate on other key presses', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Tab' });
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('has minimum 44x44px tap target via class', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-toggle');
  });

  it('hides icon from assistive tech with aria-hidden', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
