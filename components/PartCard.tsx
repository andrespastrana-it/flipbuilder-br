"use client";
import { useState } from 'react';
import { Part } from '@/lib/types';
import { ExternalLink, Plus, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { updatePart } from '@/lib/db';

export function PartCard({ part, onSelect }: { part: Part; onSelect: (part: Part) => void }) {
  const [isSearching, setIsSearching] = useState(false);
  const [localPart, setLocalPart] = useState<Part>(part);

  const handleSearchPrice = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/gemini/price-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partName: localPart.name })
      });
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const prices = data.results.map((r: any) => r.price).sort((a: number, b: number) => a - b);
        const priceMin = prices[0];
        const priceAvg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
        const priceMax = prices[prices.length - 1];

        const newHistory = [...(localPart.priceHistory || []), { date: Date.now(), price: priceAvg }].slice(-10);
        
        const storeLinks = { ...localPart.storeLinks };
        data.results.forEach((r: any) => {
          if (r.store.includes('kabum')) storeLinks.kabum = r.url;
          if (r.store.includes('terabyte')) storeLinks.terabyte = r.url;
          if (r.store.includes('pichau')) storeLinks.pichau = r.url;
          if (r.store.includes('mercado')) storeLinks.mercadoLivre = r.url;
        });

        const updates: Partial<Part> = {
          priceMin, priceAvg, priceMax,
          lastUpdated: Date.now(),
          priceHistory: newHistory,
          storeLinks
        };

        await updatePart(localPart.id, updates);
        setLocalPart({ ...localPart, ...updates });
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao buscar preço.');
    } finally {
      setIsSearching(false);
    }
  };

  const timeSinceUpdate = localPart.lastUpdated 
    ? Math.round((Date.now() - localPart.lastUpdated) / (1000 * 60 * 60)) 
    : null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center justify-between group hover:border-cyan-500/50 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shrink-0">
          <Image src={localPart.imageUrl} alt={localPart.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">{localPart.name}</div>
          <div className="text-xs text-zinc-500 mt-1">Marca: {localPart.brand} {localPart.socket && `| Socket: ${localPart.socket}`}</div>
          <div className="flex items-center space-x-3 mt-2 text-xs">
            <span className="text-zinc-400">R$ {localPart.priceMin} - R$ {localPart.priceMax}</span>
            <div className="flex space-x-2">
              {localPart.storeLinks.kabum && <a href={localPart.storeLinks.kabum} target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline flex items-center"><ExternalLink className="w-3 h-3 mr-1" /> Kabum</a>}
              {localPart.storeLinks.terabyte && <a href={localPart.storeLinks.terabyte} target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline flex items-center"><ExternalLink className="w-3 h-3 mr-1" /> Terabyte</a>}
            </div>
            {timeSinceUpdate !== null && (
              <span className="text-zinc-600 italic">atualizado há {timeSinceUpdate}h</span>
            )}
          </div>
          {localPart.priceHistory && localPart.priceHistory.length > 1 && (
            <div className="h-6 w-32 mt-2 opacity-50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={localPart.priceHistory}>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={handleSearchPrice}
          disabled={isSearching}
          className="p-2 text-zinc-400 hover:text-cyan-400 bg-zinc-900 rounded-lg transition-colors border border-zinc-800 disabled:opacity-50"
          title="Buscar preço agora"
        >
          <RefreshCw className={`w-5 h-5 ${isSearching ? 'animate-spin' : ''}`} />
        </button>
        <button 
          onClick={() => onSelect(localPart)}
          className="bg-zinc-800 hover:bg-cyan-500 hover:text-zinc-950 text-zinc-300 p-2 rounded-lg transition-colors font-medium flex items-center"
        >
          <Plus className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Selecionar</span>
        </button>
      </div>
    </div>
  );
}
