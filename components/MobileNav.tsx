'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Build' },
  { href: '/builds', label: 'Saved' },
  { href: '/ad-generator', label: 'Ads' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_94%,transparent)] backdrop-blur-xl pb-safe">
      <div className="grid grid-cols-3 h-14">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center justify-center text-[12px] font-display font-bold tracking-wide transition-colors',
                active ? 'text-[var(--ink)]' : 'text-[var(--steel-dim)]'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
