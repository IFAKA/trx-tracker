import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TRX',
  description: 'Zero-thinking guided TRX workout coach',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TRX',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

// Conditionally import DevToolsProvider — tree-shaken in production
const DevToolsWrapper = process.env.NODE_ENV === 'development'
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? (require('@/components/DevTools/DevToolsProvider') as { DevToolsProvider: React.ComponentType<{ children: React.ReactNode }> }).DevToolsProvider
  : null;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-mono antialiased`}>
        {DevToolsWrapper ? <DevToolsWrapper>{children}</DevToolsWrapper> : children}
      </body>
    </html>
  );
}
