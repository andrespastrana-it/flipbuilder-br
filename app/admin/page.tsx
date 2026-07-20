'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { runSeed } from '@/lib/seed';
import { getParts } from '@/lib/db';
import { Part } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { PageHeader, PageShell } from '@/components/PageShell';

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
      setMessage('Database seeded successfully.');
      fetchParts();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (partId: string, newPrice: number) => {
    try {
      const ref = doc(db, 'parts', partId);
      await updateDoc(ref, { priceAvg: newPrice });
      setParts(parts.map((p) => (p.id === partId ? { ...p, priceAvg: newPrice } : p)));
    } catch {
      alert('Failed to update price.');
    }
  };

  return (
    <PageShell narrow>
      <PageHeader eyebrow="System" title="Admin" />

      <section className="border border-[var(--line)] p-6 mb-6 animate-rise">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-[var(--ink)] mb-2">
          Seed catalog
        </h2>
        <p className="text-sm text-[var(--steel)] mb-5 leading-relaxed max-w-md">
          Inserts sample parts and a pre-built PC into your account.
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          type="button"
          className="btn-primary py-2.5 px-5 text-[13px]"
        >
          {loading ? 'Seeding…' : 'Run seed'}
        </button>
        {message && (
          <p className="mt-4 text-sm text-[var(--ink-soft)] border border-[var(--line)] p-3">
            {message}
          </p>
        )}
      </section>

      <section className="border border-[var(--line)] p-6 animate-rise" style={{ animationDelay: '0.05s' }}>
        <h2 className="font-mono-num text-[10px] tracking-[0.2em] uppercase text-[var(--steel)] mb-5">
          Parts · {parts.length}
        </h2>

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] font-mono-num text-[10px] uppercase tracking-[0.14em] text-[var(--steel-dim)]">
                <th className="px-2 py-3 font-medium">Part</th>
                <th className="px-2 py-3 font-medium">Cat.</th>
                <th className="px-2 py-3 font-medium text-right">Avg (R$)</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr
                  key={part.id}
                  className="border-b border-[var(--line)] hover:bg-[var(--bg-elevated)]/50 transition-colors"
                >
                  <td className="px-2 py-3 font-medium text-[var(--ink)]">{part.name}</td>
                  <td className="px-2 py-3 uppercase text-[10px] tracking-wider text-[var(--steel)] font-mono-num">
                    {part.category}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <input
                      type="number"
                      value={part.priceAvg}
                      onChange={(e) => updatePrice(part.id, Number(e.target.value))}
                      className="bg-transparent border border-[var(--line)] px-2 py-1.5 w-24 text-right font-mono-num text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                    />
                  </td>
                </tr>
              ))}
              {parts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-12 text-center text-[var(--steel)]">
                    No parts — run the seed above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
