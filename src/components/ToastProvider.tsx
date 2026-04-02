'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        className: '',
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          maxWidth: '350px',
        },
        success: {
          duration: 3000,
          style: {
            background: 'var(--success-light, #ecfdf5)',
            color: '#065f46',
            borderLeft: '4px solid var(--success, #10b981)',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: 'var(--error-light, #fef2f2)',
            color: '#b91c1c',
            borderLeft: '4px solid var(--error, #ef4444)',
          },
        },
        loading: {
          duration: 10000,
          style: {
            background: 'var(--muted, #f3f4f6)',
            color: '#1f2937',
            borderLeft: '4px solid var(--primary, #3b82f6)',
          },
        },
      }}
    />
  );
} 