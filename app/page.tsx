'use client';

import { useState, useEffect, useMemo } from 'react';
import { getParts, saveBuild } from '@/lib/db';
import { Part, Category, BuildPart, Build } from '@/lib/types';
import { useBuild } from '@/components/BuildProvider';
import { useAuth } from '@/components/AuthProvider';
import {
  Search,
  X,
  Save,
  RefreshCw,
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Fan,
  Box,
  Wind,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { BuildAssistant } from '@/components/BuildAssistant';
import { PartCard } from '@/components/PartCard';
import { LoadingState, PageShell } from '@/components/PageShell';

const CATEGORIES: {
  id: Category;
  label: string;
  short: string;
  icon: typeof Cpu;
}[] = [
  { id: 'cpu', label: 'Processor', short: 'CPU', icon: Cpu },
  { id: 'motherboard', label: 'Motherboard', short: 'MOBO', icon: CircuitBoard },
  { id: 'ram', label: 'Memory (RAM)', short: 'RAM', icon: MemoryStick },
  { id: 'gpu', label: 'Graphics card', short: 'GPU', icon: Monitor },
  { id: 'ssd', label: 'Storage', short: 'SSD', icon: HardDrive },
  { id: 'psu', label: 'Power supply', short: 'PSU', icon: Zap },
  { id: 'cooler', label: 'CPU cooler', short: 'COOL', icon: Fan },
  { id: 'case', label: 'Case', short: 'CASE', icon: Box },
  { id: 'fans', label: 'Fans / ARGB', short: 'FANS', icon: Wind },
];

function formatBRL(n: number) {
  return n.toLocaleString('pt-BR');
}

export default function PCBuilderPage() {
  const { user } = useAuth();
  const { currentBuild, updatePart, setCurrentBuild } = useBuild();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatorResult, setEstimatorResult] = useState<{
    suggestedSellPrice?: number;
    comparables?: { title: string; url: string; price: number }[];
  } | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);

  useEffect(() => {
    getParts().then((data) => {
      setParts(data);
      setLoading(false);
    });
  }, []);

  const filledCount = useMemo(
    () => CATEGORIES.filter((c) => currentBuild.parts?.[c.id]).length,
    [currentBuild.parts]
  );

  const totalCostAvg = CATEGORIES.reduce((acc, cat) => {
    const buildPart = currentBuild.parts?.[cat.id];
    if (buildPart) {
      const part = parts.find((p) => p.id === buildPart.partId);
      return acc + (part?.priceAvg || 0);
    }
    return acc;
  }, 0);

  const totalCostActual = CATEGORIES.reduce((acc, cat) => {
    const buildPart = currentBuild.parts?.[cat.id];
    return acc + (buildPart?.actualPaid || 0);
  }, 0);

  const markup = (currentBuild.markupPercent || 20) / 100;
  let suggestedPrice = totalCostActual * (1 + markup);
  if (currentBuild.aestheticMultiplier) suggestedPrice *= 1.05;

  const roundToPsychological = (val: number) => {
    const rounded = Math.round(val / 10) * 10;
    return rounded - 10 > 0 ? rounded - 10 : rounded;
  };
  const finalPrice = roundToPsychological(suggestedPrice);
  const profit = finalPrice - totalCostActual;
  const marginPct = totalCostActual > 0 ? Math.round((profit / finalPrice) * 100) : 0;

  const handleSelectPart = (part: Part) => {
    if (activeCategory) {
      updatePart(activeCategory, { partId: part.id, actualPaid: part.priceAvg });
      setActiveCategory(null);
      setSearchQuery('');
    }
  };

  const handleRemovePart = (category: Category) => {
    updatePart(category, null);
  };

  const handleActualPriceChange = (category: Category, price: number) => {
    const p = currentBuild.parts?.[category];
    if (p) updatePart(category, { ...p, actualPaid: price });
  };

  const handleUpdateAllPrices = async () => {
    const partIdsToUpdate = Object.values(currentBuild.parts || {})
      .filter(Boolean)
      .map((bp) => bp!.partId);
    if (partIdsToUpdate.length === 0) return;

    setIsUpdatingPrices(true);
    let updatedCount = 0;

    for (const partId of partIdsToUpdate) {
      const part = parts.find((p) => p.id === partId);
      if (!part) continue;

      try {
        const res = await fetch('/api/gemini/price-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partName: part.name }),
        });
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const prices = data.results
            .map((r: { price: number }) => r.price)
            .sort((a: number, b: number) => a - b);
          const priceMin = prices[0];
          const priceAvg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
          const priceMax = prices[prices.length - 1];

          setParts((prev) =>
            prev.map((p) =>
              p.id === partId ? { ...p, priceMin, priceAvg, priceMax, lastUpdated: Date.now() } : p
            )
          );
          updatedCount++;
        }
      } catch {
        console.error('Failed to update', part.name);
      }
    }

    setIsUpdatingPrices(false);
    alert(`Prices updated for ${updatedCount} part(s)!`);
  };

  const handleEstimatePrice = async () => {
    const gpuPart = currentBuild.parts?.gpu
      ? parts.find((p) => p.id === currentBuild.parts!.gpu!.partId)
      : null;
    if (!gpuPart) {
      alert('Select a graphics card first!');
      return;
    }
    const buildSummary = CATEGORIES.map((c) => {
      const p = currentBuild.parts?.[c.id];
      if (p) return parts.find((x) => x.id === p.partId)?.name || '';
      return '';
    })
      .filter(Boolean)
      .join(', ');

    setIsEstimating(true);
    try {
      const res = await fetch('/api/gemini/estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpuName: gpuPart.name, buildSummary }),
      });
      const data = await res.json();
      setEstimatorResult(data);
      if (data.suggestedSellPrice && totalCostActual > 0) {
        let suggestedMarkup = (data.suggestedSellPrice / totalCostActual - 1) * 100;
        if (currentBuild.aestheticMultiplier) suggestedMarkup -= 5;
        setCurrentBuild({ ...currentBuild, markupPercent: Math.round(suggestedMarkup) });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to estimate price.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveBuild = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const buildToSave: Build = {
        id: currentBuild.id || `build-${Date.now()}`,
        name: currentBuild.name || 'New PC',
        thumbnail: currentBuild.parts?.case
          ? parts.find((p) => p.id === currentBuild.parts!.case!.partId)?.imageUrl || ''
          : '',
        totalCost: totalCostActual,
        targetSellPrice: finalPrice,
        status: currentBuild.status || 'planejando',
        userId: user.uid,
        parts: currentBuild.parts as Record<Category, BuildPart | null>,
        aestheticMultiplier: currentBuild.aestheticMultiplier || false,
        markupPercent: currentBuild.markupPercent || 20,
        createdAt: currentBuild.createdAt || Date.now(),
      };
      await saveBuild(buildToSave);
      setCurrentBuild(buildToSave);
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to save build.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading workbench…" />;
  }

  const markupPercent = currentBuild.markupPercent || 20;

  return (
    <PageShell>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 lg:mb-12">
        <div className="min-w-0 flex-1">
          <p className="font-mono-num text-[10px] tracking-[0.28em] uppercase text-[var(--steel)] mb-3">
            Workbench · {filledCount}/9
          </p>
          <input
            type="text"
            value={currentBuild.name || ''}
            onChange={(e) => setCurrentBuild({ ...currentBuild, name: e.target.value })}
            className="bg-transparent border-0 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-[-0.045em] text-[var(--ink)] focus:outline-none w-full max-w-lg placeholder:text-[var(--steel-dim)]"
            placeholder="Build name"
          />
          <div className="mt-4 h-px w-full max-w-sm bg-[var(--line)] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--ink)]"
              initial={false}
              animate={{ width: `${(filledCount / 9) * 100}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 22 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleUpdateAllPrices}
            disabled={isUpdatingPrices || filledCount === 0}
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium disabled:opacity-40"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isUpdatingPrices && 'animate-spin')} />
            <span className="hidden sm:inline">{isUpdatingPrices ? 'Updating…' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleSaveBuild}
            disabled={isSaving}
            type="button"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-[13px]"
          >
            <Save className="w-3.5 h-3.5" />
            {saveFlash ? 'Saved' : isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          {CATEGORIES.map((category, i) => {
            const buildPart = currentBuild.parts?.[category.id];
            const part = buildPart ? parts.find((p) => p.id === buildPart.partId) : null;
            const Icon = category.icon;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.35 }}
                className="slot-row group px-1 sm:px-2"
              >
                <div
                  className={cn(
                    'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center overflow-hidden shrink-0',
                    part ? 'bg-[var(--bg-elevated)]' : 'bg-[var(--bg-elevated)]/60'
                  )}
                >
                  {part ? (
                    <Image
                      src={part.imageUrl}
                      alt={part.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full animate-slot grayscale-[15%]"
                      unoptimized
                    />
                  ) : (
                    <Icon className="w-4 h-4 text-[var(--steel-dim)]" strokeWidth={1.5} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-mono-num text-[10px] tracking-[0.16em] uppercase text-[var(--steel-dim)]">
                    {category.short}
                  </span>
                  {part ? (
                    <div className="mt-0.5">
                      <div className="text-[var(--ink)] font-medium text-sm sm:text-[15px] truncate tracking-tight">
                        {part.name}
                      </div>
                      <div className="font-mono-num text-[11px] text-[var(--steel)] mt-0.5">
                        R$ {formatBRL(part.priceMin)} – {formatBRL(part.priceMax)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-sm text-[var(--steel-dim)]">Empty</div>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {part ? (
                    <>
                      <div className="hidden sm:block text-right">
                        <label className="block font-mono-num text-[9px] tracking-[0.14em] uppercase text-[var(--steel-dim)] mb-1">
                          Paid
                        </label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--steel-dim)] font-mono-num">
                            R$
                          </span>
                          <input
                            type="number"
                            value={buildPart?.actualPaid || 0}
                            onChange={(e) =>
                              handleActualPriceChange(category.id, Number(e.target.value))
                            }
                            className="bg-transparent border border-[var(--line)] text-[var(--ink)] font-mono-num pl-7 pr-2 py-1.5 w-[6.25rem] text-right text-sm focus:outline-none focus:border-[var(--ink)]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveCategory(category.id)}
                        type="button"
                        className="hidden sm:flex text-[12px] font-medium text-[var(--steel)] hover:text-[var(--ink)] transition-colors"
                      >
                        Swap
                      </button>
                      <button
                        onClick={() => handleRemovePart(category.id)}
                        type="button"
                        className="p-1.5 text-[var(--steel-dim)] hover:text-[var(--ink)] transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      type="button"
                      className="font-display font-bold text-[13px] text-[var(--ink)] underline underline-offset-4 decoration-[var(--line)] hover:decoration-[var(--ink)] transition-colors"
                    >
                      Choose
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-6">
          <div className="border border-[var(--line)] p-6 animate-rise">
            <h2 className="font-mono-num text-[10px] tracking-[0.22em] uppercase text-[var(--steel)] mb-6">
              Margin
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-[var(--steel)]">Catalog avg</span>
                <span className="font-mono-num text-[var(--ink-soft)]">R$ {formatBRL(totalCostAvg)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[var(--steel)] text-sm">Actual</span>
                <span className="font-mono-num font-medium text-lg text-[var(--ink)]">
                  R$ {formatBRL(totalCostActual)}
                </span>
              </div>
            </div>

            <div className="border-t border-[var(--line)] pt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-[var(--steel)]">Markup</span>
                  <span className="font-mono-num text-[var(--ink)] font-medium">{markupPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={markupPercent}
                  onChange={(e) =>
                    setCurrentBuild({ ...currentBuild, markupPercent: Number(e.target.value) })
                  }
                  className="markup-slider"
                  style={{ ['--progress' as string]: `${((markupPercent - 5) / 45) * 100}%` }}
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-[var(--ink-soft)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentBuild.aestheticMultiplier || false}
                  onChange={(e) =>
                    setCurrentBuild({ ...currentBuild, aestheticMultiplier: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 accent-[var(--ink)]"
                />
                <span>
                  <span className="text-[var(--ink)]">Aesthetic build</span>
                  <span className="block text-xs text-[var(--steel-dim)] mt-0.5">+5% for RGB / looks</span>
                </span>
              </label>

              <div className="pt-1">
                <div className="font-mono-num text-[10px] tracking-[0.18em] uppercase text-[var(--steel)] mb-2">
                  Cash price
                </div>
                <div className="font-display text-[clamp(2.25rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-[var(--ink)] leading-none">
                  R$ {formatBRL(finalPrice)}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--line)] text-sm">
                  <span className="text-[var(--steel)]">Profit · {marginPct}%</span>
                  <span className="font-mono-num font-medium text-[var(--ink)]">
                    R$ {formatBRL(profit)}
                  </span>
                </div>
              </div>

              <div className="text-sm space-y-1.5">
                <div className="font-mono-num text-[10px] tracking-[0.16em] uppercase text-[var(--steel-dim)] mb-2">
                  12× (+15%)
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--steel)]">Total</span>
                  <span className="font-mono-num text-[var(--ink-soft)]">
                    R$ {formatBRL(Math.round(finalPrice * 1.15))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--steel)]">Monthly</span>
                  <span className="font-mono-num text-[var(--ink)]">
                    12× R$ {formatBRL(Math.round((finalPrice * 1.15) / 12))}
                  </span>
                </div>
              </div>

              <button
                onClick={handleEstimatePrice}
                disabled={isEstimating}
                type="button"
                className="btn-ghost w-full flex items-center justify-center gap-2 font-display font-bold text-[13px] py-3 disabled:opacity-50"
              >
                {isEstimating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Estimate market price
              </button>

              <AnimatePresence>
                {estimatorResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border border-[var(--line)] p-4">
                      <h3 className="font-display font-bold text-[var(--ink)] mb-1">
                        AI · R$ {formatBRL(estimatorResult.suggestedSellPrice || 0)}
                      </h3>
                      <p className="text-xs text-[var(--steel)] mb-2">Similar listings</p>
                      <ul className="text-xs space-y-1.5">
                        {estimatorResult.comparables?.map((c, i) => (
                          <li key={i}>
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--ink)] underline underline-offset-2 hover:opacity-60"
                            >
                              {c.title}
                            </a>
                            <span className="text-[var(--steel)] font-mono-num"> — R$ {c.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <BuildAssistant />
        </aside>
      </div>

      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[var(--ink)]/25 backdrop-blur-[2px]"
            onClick={() => setActiveCategory(null)}
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--paper)] border border-[var(--line)] w-full max-w-3xl max-h-[88dvh] flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-[var(--line)] flex items-center justify-between shrink-0">
                <div>
                  <p className="font-mono-num text-[10px] tracking-[0.2em] uppercase text-[var(--steel)]">
                    Catalog
                  </p>
                  <h2 className="font-display text-xl font-extrabold tracking-tight text-[var(--ink)] mt-1">
                    {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveCategory(null)}
                  type="button"
                  className="p-2 text-[var(--steel)] hover:text-[var(--ink)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-[var(--line)] shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--steel-dim)]" />
                  <input
                    type="text"
                    placeholder="Search name or brand…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent border border-[var(--line)] pl-10 pr-4 py-3 text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--ink)] placeholder:text-[var(--steel-dim)]"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-0">
                {parts
                  .filter((p) => p.category === activeCategory)
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((part) => (
                    <PartCard key={part.id} part={part} onSelect={handleSelectPart} />
                  ))}
                {parts.filter((p) => p.category === activeCategory).length === 0 && (
                  <div className="text-center text-[var(--steel)] py-14 text-sm">
                    No parts — run seed in Admin.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
