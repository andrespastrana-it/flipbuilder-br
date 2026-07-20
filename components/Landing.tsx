'use client';

import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { loginWithGoogle } from '@/lib/firebase';

const ease = [0.16, 1, 0.3, 1] as const;

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=2000&q=82';

export function Landing() {
  const frame = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const imgX = useTransform(sx, [0, 1], ['2.2%', '-2.2%']);
  const imgY = useTransform(sy, [0, 1], ['1.6%', '-1.6%']);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <div
      ref={frame}
      onMouseMove={onMove}
      className="landing relative min-h-dvh overflow-hidden bg-[var(--paper)]"
    >
      {/* Full-bleed visual plane */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute -inset-[4%]"
          style={{ x: imgX, y: imgY }}
          initial={{ scale: 1.14, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.55, ease }}
        >
          <Image
            src={HERO_IMAGE}
            alt="Custom gaming PC build"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center] grayscale contrast-[1.1] brightness-[0.9]"
          />
        </motion.div>

        {/* Soft paper field from the left — not a card */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, #ffffff 0%, #ffffff 34%, rgba(255,255,255,0.94) 42%, rgba(255,255,255,0.35) 54%, transparent 68%)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              'linear-gradient(180deg, transparent 28%, rgba(255,255,255,0.55) 52%, #ffffff 78%)',
          }}
          aria-hidden
        />
        <div className="landing-grain" aria-hidden />
      </div>

      <div className="relative z-10 min-h-dvh flex items-end md:items-center px-6 sm:px-10 lg:px-14 xl:px-20 pb-14 pt-28 md:py-0">
        <div className="max-w-[40rem]">
          <h1 className="font-display select-none">
            <span className="sr-only">FlipBuilder BR</span>
            <motion.span
              className="block text-[clamp(4.5rem,15vw,9rem)] font-extrabold leading-[0.84] tracking-[-0.065em] text-[var(--ink)]"
              initial={{ opacity: 0, y: 64 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, ease, delay: 0.1 }}
            >
              FlipBuilder
            </motion.span>
            <motion.span
              className="mt-0.5 block text-[clamp(4.5rem,15vw,9rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-[var(--steel)]"
              initial={{ opacity: 0, y: 64 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, ease, delay: 0.2 }}
            >
              BR
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.4 }}
            className="mt-8 max-w-[19rem] text-[1.0625rem] sm:text-lg leading-[1.4] text-[var(--ink-soft)]"
          >
            Build the setup, lock the margin, ship the listing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.52 }}
            className="mt-10"
          >
            <button
              onClick={loginWithGoogle}
              type="button"
              className="landing-cta group relative inline-flex items-center gap-5 bg-[var(--ink)] text-[var(--paper)] pl-8 pr-5 py-[1.05rem] overflow-hidden"
            >
              <span className="font-display font-bold text-[15px] tracking-[0.02em] relative z-10">
                Sign in with Google
              </span>
              <span
                className="relative z-10 flex h-10 w-10 items-center justify-center bg-[var(--paper)] text-[var(--ink)] text-lg transition-transform duration-300 ease-out group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
              <span className="landing-cta-shine" aria-hidden />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
