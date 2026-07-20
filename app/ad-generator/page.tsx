'use client';
import { useState, useEffect } from 'react';
import { useBuild } from '@/components/BuildProvider';
import { getParts } from '@/lib/db';
import { Part, Category } from '@/lib/types';
import { Copy, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

export default function AdGeneratorPage() {
  const { currentBuild } = useBuild();
  const [parts, setParts] = useState<Part[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<{agressivo: string, premium: string, direto: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'agressivo'|'premium'|'direto'>('agressivo');

  useEffect(() => {
    getParts().then(setParts);
  }, []);

  const getPartName = (cat: Category) => {
    const buildPart = currentBuild.parts?.[cat];
    if (!buildPart) return null;
    return parts.find(p => p.id === buildPart.partId)?.name;
  };

  const getPartNameFallback = (cat: Category) => getPartName(cat) || '[Peça não selecionada]';

  const totalCostActual = Object.values(currentBuild.parts || {}).reduce((acc, p) => acc + (p?.actualPaid || 0), 0);
  const markup = (currentBuild.markupPercent || 20) / 100;
  let suggestedPrice = totalCostActual * (1 + markup);
  if (currentBuild.aestheticMultiplier) suggestedPrice *= 1.05;
  const finalPrice = Math.round(suggestedPrice / 10) * 10;
  const financedPrice = Math.round(finalPrice * 1.15);
  const parcela = Math.round(financedPrice / 12);

  const gpuName = getPartName('gpu') || 'PC Gamer';
  
  const buildSummary = `
- CPU: ${getPartNameFallback('cpu')}
- Placa Mãe: ${getPartNameFallback('motherboard')}
- RAM: ${getPartNameFallback('ram')}
- GPU: ${getPartNameFallback('gpu')}
- SSD: ${getPartNameFallback('ssd')}
- Fonte: ${getPartNameFallback('psu')}
- Cooler: ${getPartNameFallback('cooler')}
- Gabinete: ${getPartNameFallback('case')}
- Fans/RGB: ${getPartNameFallback('fans')}

Formas de pagamento:
- À vista: R$ ${finalPrice}
- 12x de R$ ${parcela}
`;

  const generateAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/ad-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ build: buildSummary, price: finalPrice })
      });
      const data = await res.json();
      if (data) {
        setVariants(data);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar anúncios');
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
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-zinc-100 flex items-center">
          <Sparkles className="text-cyan-400 mr-3 w-8 h-8" />
          Gerador de Anúncio IA
        </h1>
        <button 
          onClick={generateAds}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          <span>{loading ? 'Gerando...' : 'Gerar Anúncios'}</span>
        </button>
      </div>
      
      {!variants && !loading && (
        <div className="text-center py-20 text-zinc-500 border border-zinc-800 border-dashed rounded-xl">
          Clique no botão acima para gerar 3 opções de anúncios otimizados pela IA para o seu PC.
        </div>
      )}

      {variants && !loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="flex border-b border-zinc-800">
            <button onClick={() => setActiveTab('agressivo')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'agressivo' ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>🔥 Agressivo (Venda Rápida)</button>
            <button onClick={() => setActiveTab('premium')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'premium' ? 'bg-zinc-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>✨ Premium (Qualidade)</button>
            <button onClick={() => setActiveTab('direto')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'direto' ? 'bg-zinc-800 text-zinc-100 border-b-2 border-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>⚡ Direto ao Ponto</button>
          </div>
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-end">
            <button 
              onClick={handleCopy}
              className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>
          <div className="p-6 bg-zinc-900 text-zinc-300 whitespace-pre-wrap font-sans text-sm leading-relaxed min-h-[300px]">
            {variants[activeTab]}
          </div>
        </div>
      )}
    </div>
  );
}
