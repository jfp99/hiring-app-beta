// app/layout.tsx
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hi-ring - Cabinet de Recrutement',
  description: 'Votre partenaire en recrutement innovant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={montserrat.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}