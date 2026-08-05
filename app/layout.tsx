import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstaller from '@/components/PWAInstaller';

export const metadata: Metadata = {
  title: {
    default: 'CONSTRUPLATA PRO',
    template: '%s | CONSTRUPLATA PRO',
  },
  description:
    'Gestión administrativa, financiera y operativa de proyectos de construcción.',
  applicationName: 'CONSTRUPLATA PRO',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CONSTRUPLATA',
  },
  icons: {
    icon: [
      {
        url: '/icons/favicon-64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        url: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a477f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}
