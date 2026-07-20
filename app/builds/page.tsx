'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getBuilds, deleteBuild, saveBuild } from '@/lib/db';
import { Build, BuildStatus } from '@/lib/types';
import { useBuild } from '@/components/BuildProvider';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { LoadingState, PageHeader, PageShell } from '@/components/PageShell';

const STATUS_META: Record<BuildStatus, { label: string }> = {
  planejando: { label: 'Planning' },
  comprando: { label: 'Buying' },
  montado: { label: 'Built' },
  vendido: { label: 'Sold' },
};

export default function BuildsPage() {
  const { user } = useAuth();
  const { setCurrentBuild } = useBuild();
  const router = useRouter();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BuildStatus | 'todos'>('todos');

  const fetchBuilds = async () => {
    if (user) {
      const data = await getBuilds(user.uid);
      setBuilds(data.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this PC?')) {
      await deleteBuild(id);
      fetchBuilds();
    }
  };

  const handleLoad = (build: Build) => {
    setCurrentBuild(build);
    router.push('/');
  };

  const handleStatusChange = async (build: Build, newStatus: Build['status']) => {
    await saveBuild({ ...build, status: newStatus });
    fetchBuilds();
  };

  if (loading) {
    return <LoadingState label="Loading inventory…" />;
  }

  const totalProfit = builds
    .filter((b) => b.status === 'vendido')
    .reduce((acc, b) => acc + ((b.actualSellPrice || b.targetSellPrice) - b.totalCost), 0);

  const filtered = filter === 'todos' ? builds : builds.filter((b) => b.status === filter);
  const pipeline: BuildStatus[] = ['planejando', 'comprando', 'montado', 'vendido'];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Inventory"
        title="Saved PCs"
        action={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono-num text-[10px] tracking-[0.18em] uppercase text-[var(--steel-dim)]">
                Realized profit
              </div>
              <div className="font-display text-xl font-extrabold tracking-tight text-[var(--ink)]">
                R$ {totalProfit.toLocaleString('pt-BR')}
              </div>
            </div>
            <Link
              href="/"
              className="btn-primary hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-[13px]"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-1 gap-y-2 mb-8 border-b border-[var(--line)] pb-4">
        <button
          type="button"
          onClick={() => setFilter('todos')}
          className={cn(
            'px-3 py-1.5 text-[12px] font-display font-bold tracking-wide transition-colors',
            filter === 'todos' ? 'text-[var(--ink)]' : 'text-[var(--steel-dim)] hover:text-[var(--ink)]'
          )}
        >
          All ({builds.length})
        </button>
        {pipeline.map((s) => {
          const count = builds.filter((b) => b.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1.5 text-[12px] font-display font-bold tracking-wide transition-colors',
                filter === s ? 'text-[var(--ink)]' : 'text-[var(--steel-dim)] hover:text-[var(--ink)]'
              )}
            >
              {STATUS_META[s].label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center border-t border-[var(--line)]">
          <p className="text-[var(--steel)] mb-4">No PCs in this stage.</p>
          <Link
            href="/"
            className="font-display font-bold text-sm text-[var(--ink)] underline underline-offset-4"
          >
            Build your first
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)]">
          {filtered.map((build, i) => {
            const profit = build.targetSellPrice - build.totalCost;
            return (
              <motion.article
                key={build.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex flex-col bg-[var(--paper)]"
              >
                <div className="relative h-36 bg-[var(--bg-elevated)]">
                  {build.thumbnail ? (
                    <Image
                      src={build.thumbnail}
                      alt={build.name}
                      fill
                      className="object-cover opacity-85 group-hover:opacity-100 transition-opacity grayscale-[30%]"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-3xl font-extrabold text-[var(--line-strong)]">
                        PC
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <span className="font-mono-num text-[10px] tracking-[0.14em] uppercase bg-[var(--paper)]/95 px-2 py-1 text-[var(--ink)]">
                      {STATUS_META[build.status].label}
                    </span>
                    <select
                      value={build.status}
                      onChange={(e) =>
                        handleStatusChange(build, e.target.value as BuildStatus)
                      }
                      className="bg-[var(--paper)]/95 text-[10px] font-semibold px-2 py-1 border-0 text-[var(--ink)] focus:outline-none"
                      aria-label="Change status"
                    >
                      <option value="planejando">Planning</option>
                      <option value="comprando">Buying</option>
                      <option value="montado">Built</option>
                      <option value="vendido">Sold</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-[var(--ink)] truncate">
                    {build.name}
                  </h3>
                  <p className="font-mono-num text-[11px] text-[var(--steel-dim)] mb-5">
                    {new Date(build.createdAt).toLocaleDateString('pt-BR')}
                  </p>

                  <div className="space-y-2 mb-6 flex-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--steel)]">Cost</span>
                      <span className="font-mono-num text-[var(--ink-soft)]">
                        R$ {build.totalCost.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--steel)]">Target</span>
                      <span className="font-mono-num text-[var(--ink)] font-medium">
                        R$ {build.targetSellPrice.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--line)]">
                      <span className="text-[var(--steel)]">
                        {build.status === 'vendido' ? 'Profit' : 'Margin'}
                      </span>
                      <span className="font-mono-num font-bold text-[var(--ink)]">
                        R$ {profit.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => handleLoad(build)}
                      type="button"
                      className="btn-ghost flex-1 flex items-center justify-center gap-2 py-2.5 font-display font-bold text-[13px] text-[var(--ink)]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(build.id)}
                      type="button"
                      className="p-2.5 border border-[var(--line)] text-[var(--steel)] hover:text-[var(--ink)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
