import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://loophole.games';
const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: {
    default: 'Loophole — A new puzzle, every day',
    template: '%s · Loophole',
  },
  description:
    'Eight original daily puzzle games you won\u2019t find anywhere else. Free to play, one new challenge every day.',
  openGraph: {
    type: 'website',
    siteName: 'Loophole',
    title: 'Loophole — A new puzzle, every day',
    description: 'Eight original daily puzzle games. Free to play, no download.',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loophole — A new puzzle, every day',
    description: 'Eight original daily puzzle games. Free to play, no download.',
    images: ['/api/og'],
  },
  icons: {
    icon: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    'google-site-verification': 'KYZp6leIoJkmXQipodIUtUhXTopgEfgqFiQ7eJZuRZA',
    ...(ADSENSE_CLIENT_ID ? { 'google-adsense-account': ADSENSE_CLIENT_ID } : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
  {/* Google Search Console */}
  <meta name="google-site-verification" content="KYZp6leIoJkmXQipodIUtUhXTopgEfgqFiQ7eJZuRZA" />

  {/* Prevents a light-mode flash for users who previously chose dark mode. */}
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var t=localStorage.getItem('loophole:theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
    }}
  />
  {ADSENSE_ENABLED && ADSENSE_CLIENT_ID && (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )}
</head>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body`}>
        <SiteHeader />
        <main className="max-w-5xl mx-auto px-4 py-10 min-h-[60vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}