import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gama Monitor — Project Hub',
  description: 'Real-time project monitoring with Design System control',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gama-dark text-gama-text">
        {children}
      </body>
    </html>
  )
}
