"use client";
import { useState, useEffect } from 'react';
import { useBuild } from '@/components/BuildProvider';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { Part, BuildPart } from '@/lib/types';
import { getParts } from '@/lib/db';

export function BuildAssistant() {
  const { currentBuild, setCurrentBuild } = useBuild();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>(currentBuild.chatHistory || []);
  const [loading, setLoading] = useState(false);
  const [proposedBuild, setProposedBuild] = useState<any>(null);

  useEffect(() => {
    if (currentBuild.chatHistory && currentBuild.chatHistory !== messages) {
      setMessages(currentBuild.chatHistory);
    }
  }, [currentBuild.id]);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userText = prompt;
    setPrompt('');
    
    const newMessages: {role: 'user'|'assistant', text: string}[] = [...messages, { role: 'user', text: userText }];
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
          catalog: parts.map(p => ({ id: p.id, category: p.category, name: p.name, price: p.priceAvg, socket: p.socket, ramType: p.ramType, wattage: p.wattage, lengthMm: p.lengthMm }))
        })
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
      setMessages([...messages, { role: 'assistant', text: 'Desculpe, ocorreu um erro ao processar seu pedido.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBuild = async () => {
    if (!proposedBuild) return;
    const parts = await getParts();
    
    const newPartsState: any = { ...currentBuild.parts };
    
    for (const [cat, partId] of Object.entries(proposedBuild)) {
      const p = parts.find(x => x.id === partId);
      if (p) {
        newPartsState[cat] = { partId: p.id, actualPaid: p.priceAvg };
      }
    }
    
    setCurrentBuild({ ...currentBuild, parts: newPartsState });
    setProposedBuild(null);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col h-[500px] mt-6">
      <div className="flex items-center space-x-2 text-cyan-400 mb-4 font-bold border-b border-zinc-800 pb-2">
        <Sparkles className="w-5 h-5" />
        <span>Assistente IA</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-sm">
        {messages.length === 0 && (
          <div className="text-zinc-500 italic text-center mt-4">
            Me diga o que você precisa! Ex: "Quero um PC branco com RX 9060 XT até R$ 6.000"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30' : 'bg-zinc-800 text-zinc-300'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-zinc-800 text-zinc-400 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Pensando...
            </div>
          </div>
        )}
        
        {proposedBuild && !loading && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex flex-col items-center">
            <span className="text-emerald-400 font-medium mb-2">Build Sugerida</span>
            <button 
              onClick={handleApplyBuild}
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-4 py-2 rounded-md transition-colors w-full"
            >
              Aplicar ao Montador
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-2 relative">
        <input 
          type="text" 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ex: Troque a fonte por uma mais barata..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-cyan-500 text-sm"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
