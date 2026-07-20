'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getBuilds, deleteBuild, saveBuild } from '@/lib/db';
import { Build } from '@/lib/types';
import { useBuild } from '@/components/BuildProvider';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Edit, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function BuildsPage() {
  const { user } = useAuth();
  const { setCurrentBuild } = useBuild();
  const router = useRouter();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuilds = async () => {
    if (user) {
      const data = await getBuilds(user.uid);
      setBuilds(data.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este PC?')) {
      await deleteBuild(id);
      fetchBuilds();
    }
  };

  const handleLoad = (build: Build) => {
    setCurrentBuild(build);
    router.push('/');
  };

  const handleStatusChange = async (build: Build, newStatus: Build['status']) => {
    const updated = { ...build, status: newStatus };
    await saveBuild(updated);
    fetchBuilds();
  };

  if (loading) return <div className="p-8 text-cyan-400 flex items-center"><Loader2 className="w-5 h-5 animate-spin mr-2"/> Carregando...</div>;

  const totalProfit = builds
    .filter(b => b.status === 'vendido')
    .reduce((acc, b) => acc + ((b.actualSellPrice || b.targetSellPrice) - b.totalCost), 0);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-zinc-100 flex items-center">
          <span className="text-cyan-400 mr-3">PCs Salvos</span>
        </h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-6 py-3 flex items-center space-x-4">
          <div className="text-sm text-zinc-400">Lucro Total (Vendidos)</div>
          <div className="text-xl font-bold text-emerald-400">R$ {totalProfit.toLocaleString('pt-BR')}</div>
        </div>
      </div>

      {builds.length === 0 ? (
        <div className="text-zinc-500 py-12 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
          Nenhum PC salvo encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map(build => (
            <div key={build.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col transition-colors hover:border-zinc-700">
              <div className="h-48 relative bg-zinc-950">
                {build.thumbnail && (
                  <Image src={build.thumbnail} alt={build.name} fill className="object-cover opacity-80 mix-blend-screen" unoptimized />
                )}
                <div className="absolute top-3 right-3">
                  <select 
                    value={build.status}
                    onChange={(e) => handleStatusChange(build, e.target.value as any)}
                    className="bg-zinc-950/80 backdrop-blur text-xs font-semibold px-2 py-1 rounded border border-zinc-700 text-cyan-300 focus:outline-none"
                  >
                    <option value="planejando">Planejando</option>
                    <option value="comprando">Comprando Peças</option>
                    <option value="montado">Montado (Pronto)</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-100 mb-1">{build.name}</h3>
                <div className="text-xs text-zinc-500 mb-4">{new Date(build.createdAt).toLocaleDateString('pt-BR')}</div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Custo Total:</span>
                    <span className="text-zinc-300">R$ {build.totalCost.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Preço Alvo:</span>
                    <span className="text-zinc-300 font-medium">R$ {build.targetSellPrice.toLocaleString('pt-BR')}</span>
                  </div>
                  {build.status === 'vendido' && (
                    <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                      <span className="text-emerald-500/80 font-medium">Lucro Estimado:</span>
                      <span className="text-emerald-400 font-bold">R$ {(build.targetSellPrice - build.totalCost).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-auto">
                  <button 
                    onClick={() => handleLoad(build)}
                    className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(build.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
