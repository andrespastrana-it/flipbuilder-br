import type { Metadata } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { BuildProvider } from '@/components/BuildProvider';
import { NavBar } from '@/components/NavBar';
import { MobileNav } from '@/components/MobileNav';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'FlipBuilder BR',
  description: 'Build, price, and advertise gaming PCs for resale in Brazil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body
        className="app-shell antialiased text-[var(--ink)]"
        style={{ fontFamily: 'var(--font-body)' }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <BuildProvider>
            <div className="min-h-dvh flex flex-col">
              <NavBar />
              <main className="flex-1 overflow-x-hidden pb-16 md:pb-0">{children}</main>
              <MobileNav />
            </div>
          </BuildProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
