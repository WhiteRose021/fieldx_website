// app/layout.tsx (Server Component)
import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/client-layout'

export const metadata: Metadata = {
  title: 'FieldX - FTTH Management Platform',
  description: 'The complete CRM/FSM platform for managing FTTH projects in Greece',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}