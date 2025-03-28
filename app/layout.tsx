// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/client-layout';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'FieldX',
  icons: {
    icon: '/logo.png',
  },
  description: 'The complete CRM/FSM platform for managing FTTH projects in Greece',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
        <GoogleAnalytics gaId="G-M69C5SZS5E" /> {/* Replace with your actual Google Analytics ID */}
      </body>
    </html>
  );
}