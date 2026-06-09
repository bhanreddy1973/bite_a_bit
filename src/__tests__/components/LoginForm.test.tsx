import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/components/home/LoginForm';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock stores
const mockLogin = vi.fn();
const mockAddToast = vi.fn();

vi.mock('@/stores/userStore', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => {
    const state = {
      login: mockLogin,
      isLoading: false,
    };
    return selector(state);
  },
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: unknown) => unknown) => {
    const state = {
      addToast: mockAddToast,
    };
    return selector(state);
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name and phone input fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('renders a submit button with "Continue" text', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('shows inline error when name is empty on submit', async () => {
    render(<LoginForm />);

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows inline error when name exceeds 50 characters', async () => {
    render(<LoginForm />);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'A'.repeat(51) } });

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Name must be 50 characters or less')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows inline error when phone is empty on submit', async () => {
    render(<LoginForm />);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'John' } });

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows inline error when phone is not 10 digits', async () => {
    render(<LoginForm />);

    const nameInput = screen.getByLabelText('Name');
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(phoneInput, { target: { value: '12345' } });

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Phone number must be exactly 10 digits')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates name on blur', () => {
    render(<LoginForm />);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: '123' } });
    fireEvent.blur(nameInput);

    expect(screen.getByText('Name must contain only letters and spaces')).toBeInTheDocument();
  });

  it('validates phone on blur', () => {
    render(<LoginForm />);

    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);

    expect(screen.getByText('Phone number must be exactly 10 digits')).toBeInTheDocument();
  });

  it('applies numeric mask to phone input (strips non-digits)', () => {
    render(<LoginForm />);

    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '12ab34cd56' } });

    expect(phoneInput).toHaveValue('123456');
  });

  it('calls login and redirects on success', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { id: '1', name: 'John', phone: '9876543210', restaurantName: 'bbq_in', isAuthenticated: true } });

    render(<LoginForm />);

    const nameInput = screen.getByLabelText('Name');
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('John', '9876543210', 'bbq_in');
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/menu');
    });
  });

  it('shows error toast on login failure and preserves form input', async () => {
    mockLogin.mockResolvedValue({ success: false, error: { category: 'network', message: 'Network error' } });

    render(<LoginForm />);

    const nameInput = screen.getByLabelText('Name');
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Network error',
        type: 'error',
        duration: 5000,
      });
    });

    // Form input is preserved
    expect(nameInput).toHaveValue('John');
    expect(phoneInput).toHaveValue('9876543210');
    // Does NOT redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('uses the provided restaurantName prop', async () => {
    mockLogin.mockResolvedValue({ success: true, data: { id: '1', name: 'John', phone: '9876543210', restaurantName: 'pizza_place', isAuthenticated: true } });

    render(<LoginForm restaurantName="pizza_place" />);

    const nameInput = screen.getByLabelText('Name');
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    const button = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('John', '9876543210', 'pizza_place');
    });
  });
});
