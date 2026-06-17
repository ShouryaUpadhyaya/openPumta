import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import './globals.css';
import Providers from './components/Providers';
import { Toaster } from 'sonner';
import LayoutWrapper from './components/LayoutWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://openpumta.com'),
  title: {
    default: 'openPumta | The Ultimate Yelpumta & Notion Productivity System',
    template: '%s | openPumta',
  },
  description:
    'openPumta is an open-source, desktop-first productivity system integrating Pomodoro focus tracking, habit building, and AI reflection. A powerful alternative to Yeolpumta and Notion for deep work.',
  keywords: [
    'productivity',
    'Yelpumta',
    'Yeolpumta alternative',
    'Notion alternative',
    'Pomodoro focus tracker',
    'open source habit tracker',
    'study timer',
    'deep work',
    'openPumta',
  ],
  authors: [{ name: 'Shourya Upadhyaya' }],
  creator: 'Shourya Upadhyaya',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://openpumta.com',
    title: 'openPumta | The Ultimate Yelpumta & Notion Productivity System',
    description:
      'openPumta is an open-source, desktop-first productivity system integrating Pomodoro focus tracking, habit building, and AI reflection. A powerful alternative to Yeolpumta and Notion for deep work.',
    siteName: 'openPumta',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'openPumta Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'openPumta | The Ultimate Yelpumta & Notion Productivity System',
    description:
      'openPumta is an open-source, desktop-first productivity system integrating Pomodoro focus tracking, habit building, and AI reflection. A powerful alternative to Yeolpumta and Notion for deep work.',
    images: ['/banner.png'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark w-full max-w-[100vw] overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster position="top-right" className="mr-5" richColors />
        </Providers>
      </body>
    </html>
  );
}
