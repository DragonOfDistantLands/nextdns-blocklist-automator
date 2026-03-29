import type { Metadata } from 'next'
import { Geist, Geist_Mono, Mulish } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const SITE_URL = 'https://nextdns-blocklist-automator.dragon-tools.workers.dev'
const SITE_NAME = 'NextDNS Blocklist Automator'
const DESCRIPTION =
  'A sleek, client-side, fault-tolerant tool to automatically sync massive external domain blocklists (Adblock, Hosts, Dnsmasq) directly to your NextDNS Denylist.'

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} | Sync Custom Filters`,
  },
  description: DESCRIPTION,
  keywords: [
    'NextDNS',
    'blocklist',
    'adblock',
    'dnsmasq',
    'hosts',
    'hagezi',
    'oisd',
    'privacy',
    'network security',
    'denylist automator',
  ],
  authors: [
    { name: 'DragonOfDistantLands', url: 'https://github.com/DragonOfDistantLands' },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Sync Custom Filters`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Sync Custom Filters`,
    description: DESCRIPTION,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mulish.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
