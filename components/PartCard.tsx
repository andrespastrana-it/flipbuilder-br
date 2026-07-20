'use client';

import { useState } from 'react';
import { Part } from '@/lib/types';
import { ExternalLink, Plus, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { updatePart } from '@/lib/db';
import { cn } from '@/lib/utils';

export function PartCard({ part, onSelect }: { part: Part; onSelect: (part: Part) => void }) {
  const [isSearching, setIsSearching] = useState(false);
  const [localPart, setLocalPart] = useState<Part>(part);

  const handleSearchPrice = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/gemini/price-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partName: localPart.name }),
      });
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const prices = data.results
          .map((r: { price: number }) => r.price)
          .sort((a: number, b: number) => a - b);
        const priceMin = prices[0];
        const priceAvg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
        const priceMax = prices[prices.length - 1];

        const newHistory = [
          ...(localPart.priceHistory || []),
          { date: Date.now(), price: priceAvg },
        ].slice(-10);

        const storeLinks = { ...localPart.storeLinks };
        data.results.forEach((r: { store: string; url: string }) => {
          if (r.store.includes('kabum')) storeLinks.kabum = r.url;
          if (r.store.includes('terabyte')) storeLinks.terabyte = r.url;
          if (r.store.includes('pichau')) storeLinks.pichau = r.url;
          if (r.store.includes('mercado')) storeLinks.mercadoLivre = r.url;
        });

        const updates: Partial<Part> = {
          priceMin,
          priceAvg,
          priceMax,
          lastUpdated: Date.now(),
          priceHistory: newHistory,
          storeLinks,
        };

        await updatePart(localPart.id, updates);
        setLocalPart({ ...localPart, ...updates });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to fetch price.');
    } finally {
      setIsSearching(false);
    }
  };

  const timeSinceUpdate = localPart.lastUpdated
    ? Math.round((Date.now() - localPart.lastUpdated) / (1000 * 60 * 60))
    : null;

  return (
    <div className="slot-row group !gap-3 sm:!gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--bg-elevated)] overflow-hidden shrink-0">
        <Image
          src={localPart.imageUrl}
          alt={localPart.name}
          width={56}
          height={56}
          className="object-cover w-full h-full grayscale-[20%]"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm sm:text-[15px] text-[var(--ink)] truncate tracking-tight">
          {localPart.name}
        </div>
        <div className="text-[11px] text-[var(--steel-dim)] mt-0.5">
          {localPart.brand}
          {localPart.socket && ` · ${localPart.socket}`}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px]">
          <span className="font-mono-num text-[var(--steel)]">
            R$ {localPart.priceMin} – {localPart.priceMax}
          </span>
          {localPart.storeLinks.kabum && (
            <a
              href={localPart.storeLinks.kabum}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--ink)] underline underline-offset-2 hover:opacity-50 inline-flex items-center gap-0.5"
            >
              <ExternalLink className="w-3 h-3" /> KaBuM
            </a>
          )}
          {timeSinceUpdate !== null && (
            <span className="text-[var(--steel-dim)]">{timeSinceUpdate}h ago</span>
          )}
        </div>
        {localPart.priceHistory && localPart.priceHistory.length > 1 && (
          <div className="h-4 w-24 mt-1.5 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={localPart.priceHistory}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#111111"
                  strokeWidth={1.25}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleSearchPrice}
          disabled={isSearching}
          type="button"
          className="p-2 text-[var(--steel)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
          title="Fetch price now"
        >
          <RefreshCw className={cn('w-4 h-4', isSearching && 'animate-spin')} />
        </button>
        <button
          onClick={() => onSelect(localPart)}
          type="button"
          className="btn-primary p-2 sm:px-3 sm:py-2 text-sm flex items-center"
        >
          <Plus className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Select</span>
        </button>
      </div>
    </div>
  );
}
