// components/client-layout.tsx
"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}