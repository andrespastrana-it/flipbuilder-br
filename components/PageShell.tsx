'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as const;

export function PageHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 lg:mb-12',
        className
      )}
    >
      <div className="min-w-0">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="font-mono-num text-[10px] tracking-[0.28em] uppercase text-[var(--steel)] mb-3"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.06 }}
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold tracking-[-0.045em] leading-[0.95] text-[var(--ink)]"
        >
          {title}
        </motion.h1>
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease, delay: 0.12 }}
          className="shrink-0"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}

export function PageShell({
  children,
  narrow,
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        'mx-auto px-5 sm:px-8 lg:px-10 py-8 lg:py-12',
        narrow ? 'max-w-3xl' : 'max-w-7xl'
      )}
    >
      {children}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] animate-pulse" />
        <span className="font-display text-sm font-semibold tracking-wide text-[var(--steel)]">
          {label}
        </span>
      </div>
    </div>
  );
}
