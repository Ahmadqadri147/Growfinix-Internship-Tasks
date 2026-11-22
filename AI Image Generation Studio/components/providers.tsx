'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from './session-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        gutter={10}
        toastOptions={{
          duration: 4200,
          style: {
            background: 'var(--surface-strong)',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            boxShadow: 'none',
            fontSize: '13px',
            lineHeight: '1.5',
            padding: '10px 14px',
            maxWidth: '380px',
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: 'var(--surface-strong)' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: 'var(--surface-strong)' },
          },
        }}
      />
    </SessionProvider>
  );
}
