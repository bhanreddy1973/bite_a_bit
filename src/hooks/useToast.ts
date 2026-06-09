'use client';

import { useUIStore, ToastData } from '@/stores/uiStore';

interface UseToastReturn {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

/**
 * useToast — convenience hook for accessing toast state and actions from uiStore.
 *
 * @returns { toasts, addToast, removeToast }
 */
export function useToast(): UseToastReturn {
  const toasts = useUIStore((state) => state.toasts);
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  return { toasts, addToast, removeToast };
}

export default useToast;
