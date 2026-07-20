import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { BuildProvider } from '@/components/BuildProvider';
import { NavBar } from '@/components/NavBar';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'FlipBuilder BR',
  description: 'Planejador de setups PC Gamer para revenda no Brasil.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <BuildProvider>
            <div className="min-h-screen flex flex-col">
              <NavBar />
              <main className="flex-1 overflow-x-hidden">
                {children}
              </main>
            </div>
          </BuildProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
