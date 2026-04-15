import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { CartFavProvider } from '@/context/CartFavContext';
import { ThemeProvider } from 'next-themes';
import { AuthInitializer } from '@/components/providers/AuthInitializer';

export const metadata: Metadata = {
  title: 'DreamClick — Creative Marketplace',
  description:
    'Discover, preview, and download professional VN-style video editing templates. A creator-first marketplace for photographers and video editors.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="vite-ui-theme"
        >
          <QueryProvider>
            <CartFavProvider>
              <AuthInitializer />
              {children}
            </CartFavProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
