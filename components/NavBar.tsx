'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { LogOut, Wrench, FileText, Database, UserCircle } from 'lucide-react';
import clsx from 'clsx';

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/', label: 'Montador', icon: Wrench },
    { href: '/builds', label: 'Salvos', icon: Database },
    { href: '/ad-generator', label: 'Anúncios', icon: FileText },
  ];

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-cyan-400">FlipBuilder<span className="text-zinc-100">BR</span></span>
          </Link>
          <div className="hidden md:flex space-x-1">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                    isActive ? "bg-zinc-800 text-cyan-400 font-medium" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              href="/admin"
              className={clsx(
                "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                pathname === '/admin' ? "bg-zinc-800 text-cyan-400 font-medium" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
            >
              <UserCircle className="w-4 h-4" />
              <span>Admin (DB Seed)</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-zinc-400 hidden sm:block">
            {user?.email}
          </div>
          <button
            onClick={logout}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
