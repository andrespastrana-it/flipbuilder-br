'use client';

import { useState, useEffect, useRef } from 'react';
import { useBuild } from '@/components/BuildProvider';
import { Send, Loader2 } from 'lucide-react';
import { getParts } from '@/lib/db';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BuildAssistant() {
  const { currentBuild, setCurrentBuild } = useBuild();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>(
    currentBuild.chatHistory || []
  );
  const [loading, setLoading] = useState(false);
  const [proposedBuild, setProposedBuild] = useState<Partial<Record<Category, string>> | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentBuild.chatHistory && currentBuild.chatHistory !== messages) {
      setMessages(currentBuild.chatHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBuild.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, proposedBuild]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userText = prompt;
    setPrompt('');

    const newMessages: { role: 'user' | 'assistant'; text: string }[] = [
      ...messages,
      { role: 'user', text: userText },
    ];
    setMessages(newMessages);
    setCurrentBuild({ ...currentBuild, chatHistory: newMessages });
    setLoading(true);

    try {
      const parts = await getParts();
      const res = await fetch('/api/gemini/build-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          history: messages,
          catalog: parts.map((p) => ({
            id: p.id,
            category: p.category,
            name: p.name,
            price: p.priceAvg,
            socket: p.socket,
            ramType: p.ramType,
            wattage: p.wattage,
            lengthMm: p.lengthMm,
          })),
        }),
      });
      const data = await res.json();

      const assistantMsg = { role: 'assistant' as const, text: data.response };
      const finalMessages = [...newMessages, assistantMsg];

      setMessages(finalMessages);
      setCurrentBuild({ ...currentBuild, chatHistory: finalMessages });

      if (data.proposedBuild) {
        setProposedBuild(data.proposedBuild);
      }
    } catch (e) {
      console.error(e);
      setMessages([
        ...messages,
        { role: 'assistant', text: 'Sorry, something went wrong processing your request.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBuild = async () => {
    if (!proposedBuild) return;
    const parts = await getParts();

    const newPartsState: Record<Category, { partId: string; actualPaid: number } | null> = {
      cpu: currentBuild.parts?.cpu ?? null,
      motherboard: currentBuild.parts?.motherboard ?? null,
      ram: currentBuild.parts?.ram ?? null,
      gpu: currentBuild.parts?.gpu ?? null,
      ssd: currentBuild.parts?.ssd ?? null,
      psu: currentBuild.parts?.psu ?? null,
      cooler: currentBuild.parts?.cooler ?? null,
      case: currentBuild.parts?.case ?? null,
      fans: currentBuild.parts?.fans ?? null,
    };

    for (const [cat, partId] of Object.entries(proposedBuild)) {
      const p = parts.find((x) => x.id === partId);
      if (p) {
        newPartsState[cat as Category] = { partId: p.id, actualPaid: p.priceAvg };
      }
    }

    setCurrentBuild({ ...currentBuild, parts: newPartsState });
    setProposedBuild(null);
  };

  const suggestions = [
    'White PC with RX 9060 under R$ 6k',
    'Swap the PSU for something cheaper',
    'Maximize FPS at 1080p',
  ];

  return (
    <div className="border border-[var(--line)] flex flex-col h-[400px] sm:h-[440px] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--line)] shrink-0">
        <span className="font-mono-num text-[10px] tracking-[0.22em] uppercase text-[var(--steel)]">
          AI assistant
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-sm">
        {messages.length === 0 && (
          <div className="space-y-4 pt-1">
            <p className="text-[var(--steel)] text-sm leading-relaxed">
              Describe the build — budget, look, gaming focus.
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-left text-[12px] text-[var(--steel)] hover:text-[var(--ink)] transition-colors underline underline-offset-4 decoration-[var(--line)] hover:decoration-[var(--ink)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'px-3.5 py-2.5 max-w-[88%] leading-relaxed text-[13px]',
                m.role === 'user'
                  ? 'bg-[var(--ink)] text-[var(--paper)]'
                  : 'border border-[var(--line)] text-[var(--ink-soft)]'
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 border border-[var(--line)] text-[var(--steel)] flex items-center text-[13px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
              Thinking…
            </div>
          </div>
        )}

        {proposedBuild && !loading && (
          <div className="border border-[var(--line)] p-3.5">
            <p className="font-mono-num text-[10px] tracking-[0.16em] uppercase text-[var(--steel)] mb-2">
              Suggested build
            </p>
            <button
              onClick={handleApplyBuild}
              type="button"
              className="btn-primary w-full px-4 py-2.5 text-[13px]"
            >
              Apply to workbench
            </button>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[var(--line)] flex gap-2 shrink-0">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="e.g. White PC under R$ 6,000…"
          className="flex-1 bg-transparent border border-[var(--line)] px-3 py-2.5 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] text-sm placeholder:text-[var(--steel-dim)]"
        />
        <button
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
          type="button"
          className="btn-primary p-2.5 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
