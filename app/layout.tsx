import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import Script from 'next/script'
import { ScrollToTop } from '@/components/scroll-to-top'
import { WhatsAppPopup } from '@/components/whatsapp-popup'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/footer'
import { PageTransition } from '@/components/page-transition'
import { SurpriseMe } from '@/components/surprise-me'
import { NetworkStatus } from '@/components/network-status'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const bebasNeue = Bebas_Neue({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-bebas'
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techvyro.replit.app';

export const metadata: Metadata = {
  title: {
    default: 'TechVyro - Watch Movies & TV Shows',
    template: '%s | TechVyro',
  },
  description: 'Discover and stream the latest movies and TV shows. Browse popular, top-rated, and trending content on TechVyro — your ultimate entertainment destination.',
  metadataBase: new URL(siteUrl),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TechVyro',
  },
  openGraph: {
    type: 'website',
    siteName: 'TechVyro',
    title: 'TechVyro - Watch Movies & TV Shows',
    description: 'Discover and stream the latest movies and TV shows. Browse popular, top-rated, and trending content.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechVyro - Watch Movies & TV Shows',
    description: 'Discover and stream the latest movies and TV shows.',
    site: '@TechVyro',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical domains for faster loading */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
      </head>
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased pb-16 md:pb-0`} suppressHydrationWarning>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6111784142192967"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <NetworkStatus />
          <PageTransition />
          {children}
          <Footer />
          <WhatsAppPopup />
          <SurpriseMe variant="floating" />
          <ScrollToTop />
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
