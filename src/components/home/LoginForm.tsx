'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { validateName, validatePhone } from '@/utils/validation';

interface LoginFormProps {
  restaurantName?: string;
}

export function LoginForm({ restaurantName = 'bbq_in' }: LoginFormProps) {
  const router = useRouter();
  const login = useUserStore((state) => state.login);
  const isLoading = useUserStore((state) => state.isLoading);
  const addToast = useUIStore((state) => state.addToast);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateNameField = useCallback((value: string): boolean => {
    const result = validateName(value);
    setNameError(result.valid ? '' : (result.error ?? ''));
    return result.valid;
  }, []);

  const validatePhoneField = useCallback((value: string): boolean => {
    const result = validatePhone(value);
    setPhoneError(result.valid ? '' : (result.error ?? ''));
    return result.valid;
  }, []);

  const handleNameBlur = useCallback(() => {
    if (name.length > 0) {
      validateNameField(name);
    }
  }, [name, validateNameField]);

  const handlePhoneBlur = useCallback(() => {
    if (phone.length > 0) {
      validatePhoneField(phone);
    }
  }, [phone, validatePhoneField]);

  const handlePhoneChange = useCallback(
    (value: string) => {
      // Numeric mask: only allow digits, max 10
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setPhone(digitsOnly);
      // Clear error on change if user is correcting input
      if (phoneError) {
        setPhoneError('');
      }
    },
    [phoneError],
  );

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      // Clear error on change if user is correcting input
      if (nameError) {
        setNameError('');
      }
    },
    [nameError],
  );

  const handleSubmit = useCallback(async () => {
    // Validate both fields on submit
    const isNameValid = validateNameField(name);
    const isPhoneValid = validatePhoneField(phone);

    if (!isNameValid || !isPhoneValid) {
      return;
    }

    const result = await login(name, phone, restaurantName);

    if (result.success) {
      router.push('/menu');
    } else {
      addToast({
        message: result.error.message || 'Login failed. Please try again.',
        type: 'error',
        duration: 5000,
      });
    }
  }, [name, phone, restaurantName, validateNameField, validatePhoneField, login, router, addToast]);

  return (
    <div style={formContainerStyle}>
      <h2 style={headingStyle}>Welcome</h2>
      <p style={subtitleStyle}>Enter your details to get started</p>

      <div style={fieldsContainerStyle}>
        <div onBlur={handleNameBlur}>
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={handleNameChange}
            error={nameError}
            placeholder="Enter your name"
          />
        </div>

        <div onBlur={handlePhoneBlur}>
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            error={phoneError}
            placeholder="10-digit phone number"
          />
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <Button variant="primary" size="lg" fullWidth isLoading={isLoading} onClick={handleSubmit}>
          Continue
        </Button>
      </div>
    </div>
  );
}

const formContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4, 16px)',
  padding: 'var(--space-6, 24px)',
  backgroundColor: 'var(--color-surface, #FFFFFF)',
  borderRadius: 'var(--radius-xl, 16px)',
  boxShadow: 'var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.08))',
  width: '100%',
  maxWidth: '400px',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family, Inter, -apple-system, sans-serif)',
  fontSize: 'var(--font-size-heading, 24px)',
  fontWeight: 'var(--font-weight-bold, 700)' as React.CSSProperties['fontWeight'],
  color: 'var(--color-text-primary, #1C1C1E)',
  margin: 0,
  lineHeight: 'var(--line-height-tight, 1.2)',
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-family, Inter, -apple-system, sans-serif)',
  fontSize: 'var(--font-size-body, 16px)',
  fontWeight: 'var(--font-weight-regular, 400)' as React.CSSProperties['fontWeight'],
  color: 'var(--color-text-secondary, #3C3C43)',
  margin: 0,
  lineHeight: 'var(--line-height-normal, 1.5)',
};

const fieldsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4, 16px)',
};

const buttonContainerStyle: React.CSSProperties = {
  marginTop: 'var(--space-4, 16px)',
};

export default LoginForm;
