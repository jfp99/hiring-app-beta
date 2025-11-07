// app/layout.tsx
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Toaster } from './components/ui/Toaster'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import ErrorBoundary from './components/ErrorBoundary'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Hi-ring - Cabinet de Recrutement',
    template: '%s | Hi-ring'
  },
  description: 'Plateforme ATS/CRM de recrutement innovante. Gérez vos candidats, automatisez vos processus et trouvez les meilleurs talents avec Hi-ring.',
  keywords: [
    'recrutement',
    'ATS',
    'CRM',
    'gestion candidats',
    'pipeline recrutement',
    'cabinet recrutement',
    'plateforme recrutement',
    'automatisation recrutement',
    'talent acquisition'
  ],
  authors: [{ name: 'Hi-ring' }],
  creator: 'Hi-ring',
  publisher: 'Hi-ring',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'Hi-ring',
    title: 'Hi-ring - Cabinet de Recrutement',
    description: 'Plateforme ATS/CRM de recrutement innovante',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hi-ring - Plateforme de recrutement'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hi-ring - Cabinet de Recrutement',
    description: 'Plateforme ATS/CRM de recrutement innovante',
    images: ['/og-image.png'],
    creator: '@hiring'
  },
  alternates: {
    canonical: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Performance optimization: preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  let theme = localStorage.getItem('theme');
                  // If theme is 'system' from old settings, default to 'light'
                  if (!theme || theme === 'system') {
                    theme = 'light';
                  }
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={montserrat.className} suppressHydrationWarning>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}