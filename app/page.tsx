'use client';

import { useState, useEffect } from 'react';
import { getParts, saveBuild } from '@/lib/db';
import { Part, Category, BuildPart, Build } from '@/lib/types';
import { useBuild } from '@/components/BuildProvider';
import { useAuth } from '@/components/AuthProvider';
import { Search, Plus, X, MonitorPlay, Save, ExternalLink, RefreshCw } from 'lucide-react';
import Image from 'next/image';

import { BuildAssistant } from '@/components/BuildAssistant';
import { PartCard } from '@/components/PartCard';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'cpu', label: 'Processador (CPU)' },
  { id: 'motherboard', label: 'Placa Mãe' },
  { id: 'ram', label: 'Memória RAM' },
  { id: 'gpu', label: 'Placa de Vídeo (GPU)' },
  { id: 'ssd', label: 'Armazenamento (SSD)' },
  { id: 'psu', label: 'Fonte de Alimentação' },
  { id: 'cooler', label: 'CPU Cooler' },
  { id: 'case', label: 'Gabinete' },
  { id: 'fans', label: 'Kit de Ventoinhas / ARGB' },
];

export default function PCBuilderPage() {
  const { user } = useAuth();
  const { currentBuild, updatePart, setCurrentBuild } = useBuild();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getParts().then(data => {
      setParts(data);
      setLoading(false);
    });
  }, []);

  const totalCostAvg = CATEGORIES.reduce((acc, cat) => {
    const buildPart = currentBuild.parts?.[cat.id];
    if (buildPart) {
      const part = parts.find(p => p.id === buildPart.partId);
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
  if (currentBuild.aestheticMultiplier) {
    suggestedPrice = suggestedPrice * 1.05;
  }

  const roundToPsychological = (val: number) => {
    const rounded = Math.round(val / 10) * 10;
    return rounded - 10 > 0 ? rounded - 10 : rounded;
  };
  const finalPrice = roundToPsychological(suggestedPrice);
  const profit = finalPrice - totalCostActual;

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
    if (p) {
      updatePart(category, { ...p, actualPaid: price });
    }
  };

  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatorResult, setEstimatorResult] = useState<any>(null);

  const handleUpdateAllPrices = async () => {
    const partIdsToUpdate = Object.values(currentBuild.parts || {}).filter(Boolean).map(bp => bp!.partId);
    if (partIdsToUpdate.length === 0) return;

    setIsUpdatingPrices(true);
    let updatedCount = 0;
    
    for (const partId of partIdsToUpdate) {
      const part = parts.find(p => p.id === partId);
      if (!part) continue;
      
      try {
        const res = await fetch('/api/gemini/price-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partName: part.name })
        });
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
          const prices = data.results.map((r: any) => r.price).sort((a: number, b: number) => a - b);
          const priceMin = prices[0];
          const priceAvg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
          const priceMax = prices[prices.length - 1];

          setParts(prev => prev.map(p => {
            if (p.id === partId) {
              return { ...p, priceMin, priceAvg, priceMax, lastUpdated: Date.now() };
            }
            return p;
          }));
          
          updatedCount++;
        }
      } catch (e) {
        console.error("Erro ao atualizar", part.name);
      }
    }
    
    setIsUpdatingPrices(false);
    alert(`Preços atualizados para ${updatedCount} peça(s)!`);
  };

  const handleEstimatePrice = async () => {
    const gpuPart = currentBuild.parts?.gpu ? parts.find(p => p.id === currentBuild.parts!.gpu!.partId) : null;
    if (!gpuPart) {
      alert("Selecione uma Placa de Vídeo primeiro!");
      return;
    }
    const buildSummary = CATEGORIES.map(c => {
      const p = currentBuild.parts?.[c.id];
      if (p) {
        const part = parts.find(x => x.id === p.partId);
        return part?.name || '';
      }
      return '';
    }).filter(Boolean).join(", ");

    setIsEstimating(true);
    try {
      const res = await fetch('/api/gemini/estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpuName: gpuPart.name, buildSummary })
      });
      const data = await res.json();
      setEstimatorResult(data);
      if (data.suggestedSellPrice && totalCostActual > 0) {
        let suggestedMarkup = ((data.suggestedSellPrice / totalCostActual) - 1) * 100;
        if (currentBuild.aestheticMultiplier) suggestedMarkup -= 5;
        setCurrentBuild({ ...currentBuild, markupPercent: Math.round(suggestedMarkup) });
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao estimar preço.");
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
        name: currentBuild.name || "Novo PC",
        thumbnail: currentBuild.parts?.case ? parts.find(p => p.id === currentBuild.parts!.case!.partId)?.imageUrl || '' : '',
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
      alert('Setup salvo com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar setup.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-cyan-400">Carregando peças...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <MonitorPlay className="w-6 h-6 text-cyan-400" />
            <input 
              type="text" 
              value={currentBuild.name || ''} 
              onChange={e => setCurrentBuild({ ...currentBuild, name: e.target.value })}
              className="bg-transparent border-b border-zinc-700 text-2xl font-bold text-zinc-100 focus:outline-none focus:border-cyan-500 pb-1 w-full max-w-xs transition-colors"
              placeholder="Nome do Setup"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleUpdateAllPrices}
              disabled={isUpdatingPrices}
              className="flex items-center justify-center space-x-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isUpdatingPrices ? 'Atualizando...' : 'Atualizar Preços'}</span>
            </button>
            <button 
              onClick={handleSaveBuild}
              disabled={isSaving}
              className="flex items-center justify-center space-x-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar Setup'}</span>
            </button>
          </div>
        </div>

        {CATEGORIES.map(category => {
          const buildPart = currentBuild.parts?.[category.id];
          const part = buildPart ? parts.find(p => p.id === buildPart.partId) : null;

          return (
            <div key={category.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between transition-colors hover:border-zinc-700">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {part ? (
                    <Image src={part.imageUrl} alt={part.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <div className="text-xs text-zinc-600 font-medium tracking-wider uppercase text-center">{category.id}</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-zinc-400">{category.label}</h3>
                  {part ? (
                    <div className="mt-1">
                      <div className="text-zinc-100 font-semibold">{part.name}</div>
                      <div className="text-xs text-zinc-500 mt-1 flex space-x-2">
                        <span>Min: R$ {part.priceMin}</span>
                        <span>Média: R$ {part.priceAvg}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-zinc-600 text-sm">Nenhuma peça selecionada</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 shrink-0">
                {part ? (
                  <>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-zinc-400 mb-1">Preço Pago (R$)</div>
                      <input 
                        type="number"
                        value={buildPart?.actualPaid || 0}
                        onChange={(e) => handleActualPriceChange(category.id, Number(e.target.value))}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-1.5 rounded-md w-28 text-right text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button 
                      onClick={() => handleRemovePart(category.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remover"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className="flex items-center space-x-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Escolher</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Calculator Sidebar */}
      <div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-zinc-100 mb-6">Custos e Margem</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Custo Total (Média)</span>
              <span className="text-zinc-300 font-mono">R$ {totalCostAvg.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Custo Total (Real)</span>
              <span className="text-zinc-100 font-bold font-mono text-lg">R$ {totalCostActual.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                Markup (%)
                <span className="text-cyan-400 font-mono">{currentBuild.markupPercent}%</span>
              </label>
              <input 
                type="range" 
                min="5" max="50" step="5"
                value={currentBuild.markupPercent || 20}
                onChange={(e) => setCurrentBuild({ ...currentBuild, markupPercent: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            <label className="flex items-center space-x-3 text-sm text-zinc-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentBuild.aestheticMultiplier || false}
                onChange={(e) => setCurrentBuild({ ...currentBuild, aestheticMultiplier: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500/20 bg-zinc-950"
              />
              <span>Build estética (+5% valor agregado)</span>
            </label>

            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
              <div className="text-sm text-zinc-400 mb-1">Preço Sugerido (À Vista)</div>
              <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
                R$ {finalPrice.toLocaleString('pt-BR')}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Lucro Líquido:</span>
                <span className="text-emerald-400 font-medium">R$ {profit.toLocaleString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800 text-sm">
              <div className="text-zinc-400 mb-2 font-medium">Simulação Parcelado (12x)</div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-500">Valor Total:</span>
                <span className="text-zinc-300">R$ {Math.round(finalPrice * 1.15).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Parcelas:</span>
                <span className="text-zinc-300">12x R$ {Math.round((finalPrice * 1.15)/12).toLocaleString('pt-BR')}</span>
              </div>
            </div>
            
            <button 
              onClick={handleEstimatePrice}
              disabled={isEstimating}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-zinc-50 font-bold py-2 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              {isEstimating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
              Estimar preço de venda na IA
            </button>
            
            {estimatorResult && (
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg">
                <h3 className="text-emerald-400 font-bold mb-2">IA sugere: R$ {estimatorResult.suggestedSellPrice?.toLocaleString('pt-BR')}</h3>
                <p className="text-zinc-400 text-xs mb-2">Com base em anúncios similares:</p>
                <ul className="text-xs text-zinc-300 space-y-2">
                  {estimatorResult.comparables?.map((c: any, i: number) => (
                    <li key={i}><a href={c.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{c.title}</a> - R$ {c.price}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <BuildAssistant />
      </div>

      {/* Part Picker Modal */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
              <h2 className="text-lg font-bold text-zinc-100">Escolher {CATEGORIES.find(c => c.id === activeCategory)?.label}</h2>
              <button onClick={() => setActiveCategory(null)} className="p-2 text-zinc-400 hover:text-zinc-100 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-zinc-800 bg-zinc-900">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Buscar peças..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {parts
                .filter(p => p.category === activeCategory)
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(part => (
                  <PartCard key={part.id} part={part} onSelect={handleSelectPart} />
              ))}
              {parts.filter(p => p.category === activeCategory).length === 0 && (
                <div className="text-center text-zinc-500 py-8">Nenhuma peça cadastrada nesta categoria.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
