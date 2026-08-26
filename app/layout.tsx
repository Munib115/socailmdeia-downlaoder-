import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner';
import { faqs, siteConfig } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'PakGet | Free Video Downloader in Pakistan',
    template: '%s | PakGet',
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: 'PakGet' }],
  creator: 'PakGet',
  publisher: 'PakGet',
  category: 'Technology',
  alternates: { canonical: '/', languages: { 'en-PK': '/' } },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/icons/icon-192.png' }],
  },
  openGraph: {
    title: 'PakGet | Free Video Downloader in Pakistan',
    description: siteConfig.description,
    url: '/',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PakGet video downloader' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PakGet | Free Video Downloader in Pakistan',
    description: siteConfig.description,
    images: ['/opengraph-image'],
  },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'PakGet' },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url, inLanguage: 'en-PK' },
      {
        '@type': 'WebApplication',
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web browser',
        description: siteConfig.description,
        isAccessibleForFree: true,
        areaServed: { '@type': 'Country', name: 'Pakistan' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };

  return (
    <html lang="en-PK" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <meta name="geo.region" content="PK" />
        <meta name="geo.placename" content="Pakistan" />
      </head>
      <body className="bg-background text-text-primary antialiased min-h-screen flex flex-col selection:bg-accent selection:text-white relative">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/15 blur-[100px] rounded-full pointer-events-none -z-10 transform-gpu" />
        <div className="fixed bottom-0 right-0 w-[400px] h-[250px] bg-blue-700/10 blur-[80px] rounded-full pointer-events-none -z-10 transform-gpu" />
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">{children}</main>
        <Footer />
        <PWAInstallBanner />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
                console.log('SW registration failed:', err);
              });
            });
          }
        ` }} />
      </body>
    </html>
  );
}
