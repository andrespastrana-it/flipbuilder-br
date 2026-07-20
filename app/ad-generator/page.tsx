'use client';

import { useState, useEffect } from 'react';
import { useBuild } from '@/components/BuildProvider';
import { getParts } from '@/lib/db';
import { Part, Category } from '@/lib/types';
import { Copy, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PageHeader, PageShell } from '@/components/PageShell';

const TABS = [
  { id: 'agressivo' as const, label: 'Aggressive', hint: 'Quick sale' },
  { id: 'premium' as const, label: 'Premium', hint: 'Quality' },
  { id: 'direto' as const, label: 'Direct', hint: 'No fluff' },
];

export default function AdGeneratorPage() {
  const { currentBuild } = useBuild();
  const [parts, setParts] = useState<Part[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<{
    agressivo: string;
    premium: string;
    direto: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'agressivo' | 'premium' | 'direto'>('agressivo');

  useEffect(() => {
    getParts().then(setParts);
  }, []);

  const getPartName = (cat: Category) => {
    const buildPart = currentBuild.parts?.[cat];
    if (!buildPart) return null;
    return parts.find((p) => p.id === buildPart.partId)?.name;
  };

  const getPartNameFallback = (cat: Category) => getPartName(cat) || '[Part not selected]';

  const totalCostActual = Object.values(currentBuild.parts || {}).reduce(
    (acc, p) => acc + (p?.actualPaid || 0),
    0
  );
  const markup = (currentBuild.markupPercent || 20) / 100;
  let suggestedPrice = totalCostActual * (1 + markup);
  if (currentBuild.aestheticMultiplier) suggestedPrice *= 1.05;
  const finalPrice = Math.round(suggestedPrice / 10) * 10;
  const financedPrice = Math.round(finalPrice * 1.15);
  const parcela = Math.round(financedPrice / 12);

  const filledCount = Object.values(currentBuild.parts || {}).filter(Boolean).length;

  const buildSummary = `
- CPU: ${getPartNameFallback('cpu')}
- Motherboard: ${getPartNameFallback('motherboard')}
- RAM: ${getPartNameFallback('ram')}
- GPU: ${getPartNameFallback('gpu')}
- SSD: ${getPartNameFallback('ssd')}
- PSU: ${getPartNameFallback('psu')}
- Cooler: ${getPartNameFallback('cooler')}
- Case: ${getPartNameFallback('case')}
- Fans/RGB: ${getPartNameFallback('fans')}

Payment options:
- Cash: R$ ${finalPrice}
- 12× of R$ ${parcela}
`;

  const generateAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/ad-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ build: buildSummary, price: finalPrice }),
      });
      const data = await res.json();
      if (data) setVariants(data);
    } catch (e) {
      console.error(e);
      alert('Failed to generate ads');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!variants) return;
    navigator.clipboard.writeText(variants[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Marketplace"
        title="Ad generator"
        action={
          <button
            onClick={generateAds}
            disabled={loading || filledCount === 0}
            type="button"
            className="btn-primary flex items-center justify-center gap-2 py-3 px-5 text-[13px] shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate 3 tones'}
          </button>
        }
      />

      <p className="text-[var(--steel)] text-sm -mt-6 mb-8">
        {currentBuild.name || 'New PC'} · {filledCount}/9 parts · R${' '}
        {finalPrice.toLocaleString('pt-BR')}
      </p>

      {filledCount === 0 && (
        <div className="mb-8 py-4 border-y border-[var(--line)] text-sm text-[var(--ink-soft)]">
          Assemble a build on the{' '}
          <Link href="/" className="text-[var(--ink)] font-semibold underline underline-offset-2">
            workbench
          </Link>{' '}
          before generating the ad.
        </div>
      )}

      <AnimatePresence mode="wait">
        {!variants && !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center border border-dashed border-[var(--line)]"
          >
            <p className="text-[var(--steel)] max-w-sm mx-auto text-sm leading-relaxed">
              Three listing tones for Mercado Livre and groups — aggressive, premium, and direct.
            </p>
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-24 gap-3 text-[var(--steel)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] animate-pulse" />
            <span className="font-display font-semibold tracking-wide text-sm">Writing ads…</span>
          </motion.div>
        )}

        {variants && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[var(--line)] overflow-hidden"
          >
            <div className="grid grid-cols-3 border-b border-[var(--line)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'py-3.5 px-2 text-center transition-colors border-b-2 -mb-px',
                    activeTab === tab.id
                      ? 'border-[var(--ink)] text-[var(--ink)]'
                      : 'border-transparent text-[var(--steel)] hover:text-[var(--ink)]'
                  )}
                >
                  <span className="block font-display font-bold text-sm">{tab.label}</span>
                  <span className="block text-[10px] opacity-60 mt-0.5 hidden sm:block">
                    {tab.hint}
                  </span>
                </button>
              ))}
            </div>

            <div className="px-4 py-3 border-b border-[var(--line)] flex justify-between items-center">
              <span className="font-mono-num text-[10px] tracking-[0.18em] uppercase text-[var(--steel-dim)]">
                Ready to paste
              </span>
              <button
                onClick={handleCopy}
                type="button"
                className={cn(
                  'flex items-center gap-2 font-display font-bold text-[13px] py-2 px-4 transition-all',
                  copied ? 'btn-primary' : 'btn-ghost text-[var(--ink)]'
                )}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-5 sm:p-6 text-[var(--ink-soft)] whitespace-pre-wrap text-sm leading-relaxed min-h-[280px]">
              {variants[activeTab]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
