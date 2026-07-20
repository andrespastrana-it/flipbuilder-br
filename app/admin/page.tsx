'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { runSeed } from '@/lib/seed';
import { getParts } from '@/lib/db';
import { Part } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    const data = await getParts();
    setParts(data);
  };

  const handleSeed = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      await runSeed(user.uid);
      setMessage('Banco de dados populado com sucesso!');
      fetchParts();
    } catch (error: any) {
      setMessage('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (partId: string, newPrice: number) => {
    try {
      const ref = doc(db, 'parts', partId);
      await updateDoc(ref, { priceAvg: newPrice });
      setParts(parts.map(p => p.id === partId ? { ...p, priceAvg: newPrice } : p));
    } catch (e) {
      alert('Erro ao atualizar preço.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Administração</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Popular Banco de Dados (Seed)</h2>
        <p className="text-zinc-400 mb-6">
          Isso irá inserir as peças exemplo (Ryzen 5 5600, RX 9060 XT, etc.) e um PC pré-montado na sua conta para testes.
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Populando...' : 'Executar Seed'}
        </button>
        {message && (
          <p className="mt-4 text-sm text-cyan-400 bg-cyan-400/10 p-3 rounded-md border border-cyan-400/20">
            {message}
          </p>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Gerenciar Peças e Preços</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-950 text-zinc-300">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Peça</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Preço Médio (R$)</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(part => (
                <tr key={part.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100">{part.name}</td>
                  <td className="px-4 py-3 uppercase text-xs">{part.category}</td>
                  <td className="px-4 py-3 text-right">
                    <input 
                      type="number" 
                      value={part.priceAvg}
                      onChange={(e) => updatePrice(part.id, Number(e.target.value))}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 w-24 text-right text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                  </td>
                </tr>
              ))}
              {parts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center">Nenhuma peça cadastrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
