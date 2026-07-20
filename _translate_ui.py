from pathlib import Path

ROOT = Path(r"c:\Users\andre\Desktop\flipbuilder-br")

PAGE = ROOT / "app" / "page.tsx"
t = PAGE.read_text(encoding="utf-8")
repls = [
    ("label: 'Processador'", "label: 'Processor'"),
    ("label: 'Placa-mãe'", "label: 'Motherboard'"),
    ("label: 'Memória RAM'", "label: 'Memory (RAM)'"),
    ("label: 'Placa de vídeo'", "label: 'Graphics card'"),
    ("label: 'Armazenamento'", "label: 'Storage'"),
    ("label: 'Fonte'", "label: 'Power supply'"),
    ("label: 'Cooler'", "label: 'CPU cooler'"),
    ("label: 'Gabinete'", "label: 'Case'"),
    ("label: 'Ventoinhas / ARGB'", "label: 'Fans / ARGB'"),
    ("console.error('Erro ao atualizar'", "console.error('Failed to update'"),
    (
        "alert(`Preços atualizados para ${updatedCount} peça(s)!`)",
        "alert(`Prices updated for ${updatedCount} part(s)!`)",
    ),
    ("alert('Selecione uma placa de vídeo primeiro!')", "alert('Select a graphics card first!')"),
    ("alert('Erro ao estimar preço.')", "alert('Failed to estimate price.')"),
    ("name: currentBuild.name || 'Novo PC'", "name: currentBuild.name || 'New PC'"),
    ("alert('Erro ao salvar setup.')", "alert('Failed to save build.')"),
    ("Carregando bancada…", "Loading workbench…"),
    ("Bancada · {filledCount}/9 slots", "Workbench · {filledCount}/9 slots"),
    ('placeholder="Nome do setup"', 'placeholder="Build name"'),
    ("'Atualizando…' : 'Atualizar preços'", "'Updating…' : 'Refresh prices'"),
    ("'Salvo!' : isSaving ? 'Salvando…' : 'Salvar'", "'Saved!' : isSaving ? 'Saving…' : 'Save'"),
    ("Vazio — escolha uma peça", "Empty — pick a part"),
    (">Pago<", ">Paid<"),
    (">Trocar<", ">Swap<"),
    ('title="Remover"', 'title="Remove"'),
    (">Escolher<", ">Choose<"),
    ("Custos & margem", "Costs & margin"),
    ("Custo médio catálogo", "Catalog average"),
    ("Custo real", "Actual cost"),
    ("Build estética", "Aesthetic build"),
    ("+5% valor agregado (RGB / visual)", "+5% premium for RGB / looks"),
    ("Preço à vista", "Cash price"),
    ("Lucro · {marginPct}%", "Profit · {marginPct}%"),
    ("Parcelado 12× (+15%)", "12× installments (+15%)"),
    (">Parcela<", ">Per month<"),
    ("Estimar preço no ML", "Estimate market price"),
    ("IA sugere R$", "AI suggests R$"),
    ("Com base em anúncios similares:", "Based on similar listings:"),
    (">Catálogo<", ">Catalog<"),
    ('placeholder="Buscar por nome ou marca…"', 'placeholder="Search by name or brand…"'),
    (
        "Nenhuma peça nesta categoria. Rode o seed no Admin.",
        "No parts in this category. Run the seed in Admin.",
    ),
    ("méd R$", "avg R$"),
]
for a, b in repls:
    if a not in t:
        print("MISSING page:", repr(a)[:90])
    else:
        t = t.replace(a, b)
PAGE.write_text(t, encoding="utf-8")
print("page ok")

# PartCard
pc = (ROOT / "components" / "PartCard.tsx").read_text(encoding="utf-8")
pc_repls = [
    ("alert('Erro ao buscar preço.')", "alert('Failed to fetch price.')"),
    ('title="Buscar preço agora"', 'title="Fetch price now"'),
    (">Selecionar<", ">Select<"),
]
for a, b in pc_repls:
    if a not in pc:
        print("MISSING partcard:", repr(a))
    else:
        pc = pc.replace(a, b)
(ROOT / "components" / "PartCard.tsx").write_text(pc, encoding="utf-8")
print("partcard ok")

# BuildAssistant
ba = (ROOT / "components" / "BuildAssistant.tsx").read_text(encoding="utf-8")
ba_repls = [
    (
        "Desculpe, ocorreu um erro ao processar seu pedido.",
        "Sorry, something went wrong processing your request.",
    ),
    ("'PC branco com RX 9060 até R$ 6k'", "'White PC with RX 9060 under R$ 6k'"),
    ("'Troque a fonte por algo mais barato'", "'Swap the PSU for something cheaper'"),
    ("'Maximize FPS em 1080p'", "'Maximize FPS at 1080p'"),
    ("Assistente IA", "AI assistant"),
    (
        "Descreve o setup que você quer montar — orçamento, visual, foco em jogos…",
        "Describe the build you want — budget, look, gaming focus…",
    ),
    ("Montando sugestão…", "Building suggestion…"),
    ("Build sugerida pronta", "Suggested build ready"),
    ("Aplicar na bancada", "Apply to workbench"),
    ('placeholder="Ex: PC branco até R$ 6.000…"', 'placeholder="e.g. White PC under R$ 6,000…"'),
]
for a, b in ba_repls:
    if a not in ba:
        print("MISSING ba:", repr(a)[:90])
    else:
        ba = ba.replace(a, b)
(ROOT / "components" / "BuildAssistant.tsx").write_text(ba, encoding="utf-8")
print("ba ok")
