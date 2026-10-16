import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { LanguageProvider } from '@/features/i18n/LanguageContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#090A0D' },
    { media: '(prefers-color-scheme: light)', color: '#F9FAFC' },
  ],
};

export const metadata: Metadata = {
  title: 'SocialMediaUZ — Next-Gen Social Network & 3D Friend Radar',
  description: 'Fast, secure, next-gen social network featuring interactive 3D Friend Radar, verified locations, real-time messaging, stories, and privacy-first connections.',
  keywords: ['social network', 'socialmediauz', 'friend radar', '3d globe', 'uzbekistan', 'chat', 'realtime'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <MainLayout>{children}</MainLayout>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
