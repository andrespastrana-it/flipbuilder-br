'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: '/', label: 'Builder' },
    { href: '/builds', label: 'Saved' },
    { href: '/ad-generator', label: 'Ads' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-10 min-w-0">
          <Link href="/" className="group shrink-0">
            <span className="font-display text-[15px] font-extrabold tracking-[-0.04em] text-[var(--ink)]">
              FlipBuilder
            </span>
            <span className="font-display text-[15px] font-semibold tracking-[-0.04em] text-[var(--steel)] group-hover:text-[var(--ink)] transition-colors">
              BR
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3 py-2 text-[13px] font-medium tracking-wide transition-colors',
                    active ? 'text-[var(--ink)]' : 'text-[var(--steel)] hover:text-[var(--ink)]'
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-px h-px bg-[var(--ink)]" />
                  )}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className={cn(
                'px-3 py-2 text-[13px] font-medium tracking-wide transition-colors',
                pathname === '/admin'
                  ? 'text-[var(--ink)]'
                  : 'text-[var(--steel-dim)] hover:text-[var(--steel)]'
              )}
            >
              Admin
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {user?.email && (
            <span className="hidden sm:block font-mono-num text-[11px] text-[var(--steel-dim)] truncate max-w-[140px]">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="p-2 text-[var(--steel)] hover:text-[var(--ink)] transition-colors"
            title="Sign out"
            type="button"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
