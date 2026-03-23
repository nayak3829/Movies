import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import { ScrollToTop } from '@/components/scroll-to-top'
import { WhatsAppPopup } from '@/components/whatsapp-popup'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
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

export const metadata: Metadata = {
  title: 'TechVyro - Watch Movies & TV Shows',
  description: 'Discover and stream the latest movies and TV shows. Your ultimate entertainment destination.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TechVyro',
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
      <body className={`${inter.variable} ${bebasNeue.variable} font-sans antialiased pb-16 md:pb-0`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <WhatsAppPopup />
          <ScrollToTop />
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
