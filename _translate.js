const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

function apply(file, repls) {
  const full = path.join(ROOT, file);
  let t = fs.readFileSync(full, "utf8");
  for (const [a, b] of repls) {
    if (!t.includes(a)) {
      console.log("MISSING", file, ":", JSON.stringify(a).slice(0, 90));
    } else {
      t = t.split(a).join(b);
    }
  }
  fs.writeFileSync(full, t, "utf8");
  console.log("ok", file);
}

apply("app/page.tsx", [
  ["label: 'Processador'", "label: 'Processor'"],
  ["label: 'Placa-mãe'", "label: 'Motherboard'"],
  ["label: 'Memória RAM'", "label: 'Memory (RAM)'"],
  ["label: 'Placa de vídeo'", "label: 'Graphics card'"],
  ["label: 'Armazenamento'", "label: 'Storage'"],
  ["label: 'Fonte'", "label: 'Power supply'"],
  ["label: 'Cooler'", "label: 'CPU cooler'"],
  ["label: 'Gabinete'", "label: 'Case'"],
  ["label: 'Ventoinhas / ARGB'", "label: 'Fans / ARGB'"],
  ["console.error('Erro ao atualizar'", "console.error('Failed to update'"],
  [
    "alert(`Preços atualizados para ${updatedCount} peça(s)!`)",
    "alert(`Prices updated for ${updatedCount} part(s)!`)",
  ],
  ["alert('Selecione uma placa de vídeo primeiro!')", "alert('Select a graphics card first!')"],
  ["alert('Erro ao estimar preço.')", "alert('Failed to estimate price.')"],
  ["name: currentBuild.name || 'Novo PC'", "name: currentBuild.name || 'New PC'"],
  ["alert('Erro ao salvar setup.')", "alert('Failed to save build.')"],
  ["Carregando bancada…", "Loading workbench…"],
  ["Bancada · {filledCount}/9 slots", "Workbench · {filledCount}/9 slots"],
  ['placeholder="Nome do setup"', 'placeholder="Build name"'],
  ["'Atualizando…' : 'Atualizar preços'", "'Updating…' : 'Refresh prices'"],
  ["'Salvo!' : isSaving ? 'Salvando…' : 'Salvar'", "'Saved!' : isSaving ? 'Saving…' : 'Save'"],
  ["Vazio — escolha uma peça", "Empty — pick a part"],
  [">Pago<", ">Paid<"],
  [">Trocar<", ">Swap<"],
  ['title="Remover"', 'title="Remove"'],
  [">Escolher<", ">Choose<"],
  ["Custos & margem", "Costs & margin"],
  ["Custo médio catálogo", "Catalog average"],
  ["Custo real", "Actual cost"],
  ["Build estética", "Aesthetic build"],
  ["+5% valor agregado (RGB / visual)", "+5% premium for RGB / looks"],
  ["Preço à vista", "Cash price"],
  ["Lucro · {marginPct}%", "Profit · {marginPct}%"],
  ["Parcelado 12× (+15%)", "12× installments (+15%)"],
  [">Parcela<", ">Per month<"],
  ["Estimar preço no ML", "Estimate market price"],
  ["IA sugere R$", "AI suggests R$"],
  ["Com base em anúncios similares:", "Based on similar listings:"],
  [">Catálogo<", ">Catalog<"],
  ['placeholder="Buscar por nome ou marca…"', 'placeholder="Search by name or brand…"'],
  [
    "Nenhuma peça nesta categoria. Rode o seed no Admin.",
    "No parts in this category. Run the seed in Admin.",
  ],
  ["méd R$", "avg R$"],
]);

apply("components/PartCard.tsx", [
  ["alert('Erro ao buscar preço.')", "alert('Failed to fetch price.')"],
  ['title="Buscar preço agora"', 'title="Fetch price now"'],
  [">Selecionar<", ">Select<"],
]);

apply("components/BuildAssistant.tsx", [
  [
    "Desculpe, ocorreu um erro ao processar seu pedido.",
    "Sorry, something went wrong processing your request.",
  ],
  ["'PC branco com RX 9060 até R$ 6k'", "'White PC with RX 9060 under R$ 6k'"],
  ["'Troque a fonte por algo mais barato'", "'Swap the PSU for something cheaper'"],
  ["'Maximize FPS em 1080p'", "'Maximize FPS at 1080p'"],
  ["Assistente IA", "AI assistant"],
  [
    "Descreve o setup que você quer montar — orçamento, visual, foco em jogos…",
    "Describe the build you want — budget, look, gaming focus…",
  ],
  ["Montando sugestão…", "Building suggestion…"],
  ["Build sugerida pronta", "Suggested build ready"],
  ["Aplicar na bancada", "Apply to workbench"],
  ['placeholder="Ex: PC branco até R$ 6.000…"', 'placeholder="e.g. White PC under R$ 6,000…"'],
]);

apply("app/builds/page.tsx", [
  ["label: 'Planejando'", "label: 'Planning'"],
  ["label: 'Comprando'", "label: 'Buying'"],
  ["label: 'Montado'", "label: 'Built'"],
  ["label: 'Vendido'", "label: 'Sold'"],
  ["Tem certeza que deseja excluir este PC?", "Delete this PC?"],
  ["Carregando estoque…", "Loading inventory…"],
  [">Estoque<", ">Inventory<"],
  ["PCs salvos", "Saved PCs"],
  ["Lucro realizado", "Realized profit"],
  [">Novo<", ">New<"],
  ["Todos ({builds.length})", "All ({builds.length})"],
  ["Nenhum PC neste estágio.", "No PCs in this stage."],
  ["Montar o primeiro", "Build your first"],
  ['aria-label="Alterar status"', 'aria-label="Change status"'],
  [">Planejando<", ">Planning<"],
  [">Comprando<", ">Buying<"],
  [">Montado<", ">Built<"],
  [">Vendido<", ">Sold<"],
  [">Custo<", ">Cost<"],
  [">Alvo<", ">Target<"],
  [
    "build.status === 'vendido' ? 'Lucro' : 'Margem'",
    "build.status === 'vendido' ? 'Profit' : 'Margin'",
  ],
  [">Editar<", ">Edit<"],
  ['title="Excluir"', 'title="Delete"'],
]);

apply("app/ad-generator/page.tsx", [
  ["label: 'Agressivo'", "label: 'Aggressive'"],
  ["hint: 'Venda rápida'", "hint: 'Quick sale'"],
  ["hint: 'Qualidade'", "hint: 'Quality'"],
  ["label: 'Direto'", "label: 'Direct'"],
  ["hint: 'Sem enrolação'", "hint: 'No fluff'"],
  ["'[Peça não selecionada]'", "'[Part not selected]'"],
  ["- Placa Mãe:", "- Motherboard:"],
  ["- Fonte:", "- PSU:"],
  ["- Gabinete:", "- Case:"],
  ["Formas de pagamento:", "Payment options:"],
  ["- À vista: R$", "- Cash: R$"],
  ["- 12x de R$", "- 12× of R$"],
  ["alert('Erro ao gerar anúncios')", "alert('Failed to generate ads')"],
  ["Gerador de anúncio", "Ad generator"],
  ["Setup atual:", "Current build:"],
  ["currentBuild.name || 'Novo PC'", "currentBuild.name || 'New PC'"],
  ["{filledCount}/9 peças ·", "{filledCount}/9 parts ·"],
  ["'Gerando…' : 'Gerar 3 tons'", "'Generating…' : 'Generate 3 tones'"],
  ["Monte um setup na{' '}", "Assemble a build on the{' '}"],
  [">bancada<", ">workbench<"],
  ["antes de gerar o anúncio.", "before generating the ad."],
  [
    "Gere três tons de copy otimizados pra Mercado Livre e grupos — agressivo, premium e\n              direto.",
    "Generate three listing tones optimized for Mercado Livre and groups — aggressive, premium, and direct.",
  ],
  ["Escrevendo anúncios…", "Writing ads…"],
  ["Pronto pra colar", "Ready to paste"],
  ["'Copiado!' : 'Copiar'", "'Copied!' : 'Copy'"],
]);

apply("app/admin/page.tsx", [
  ["setMessage('Banco populado com sucesso.')", "setMessage('Database seeded successfully.')"],
  ["setMessage('Erro: ' + msg)", "setMessage('Error: ' + msg)"],
  ["alert('Erro ao atualizar preço.')", "alert('Failed to update price.')"],
  [">Sistema<", ">System<"],
  ["Administração", "Administration"],
  ["Popular catálogo", "Seed catalog"],
  [
    "Insere peças de exemplo (Ryzen 5 5600, RX 9060 XT, etc.) e um PC pré-montado na sua\n              conta.",
    "Inserts sample parts (Ryzen 5 5600, RX 9060 XT, etc.) and a pre-built PC into your\n              account.",
  ],
  ["'Populando…' : 'Executar seed'", "'Seeding…' : 'Run seed'"],
  ["Peças · {parts.length}", "Parts · {parts.length}"],
  [">Peça<", ">Part<"],
  [">Preço méd. (R$)<", ">Avg price (R$)<"],
  ["Nenhuma peça — rode o seed acima.", "No parts — run the seed above."],
]);

console.log("UI done");
