import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/features/auth/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { BackendModeIndicator } from '@/components/shared/BackendModeIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CEOWEB - Executive Social Network & Leadership Guilds',
  description: 'Master your network, share your vision, and lead with your circle. Combines ephemeral stories, wall mechanics, belt ranks progression, and collaborative story chains.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
            <BackendModeIndicator />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
