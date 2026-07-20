from pathlib import Path

ROOT = Path(r"c:\Users\andre\Desktop\flipbuilder-br")

# builds page
bp = (ROOT / "app" / "builds" / "page.tsx").read_text(encoding="utf-8")
bp_repls = [
    ("label: 'Planejando'", "label: 'Planning'"),
    ("label: 'Comprando'", "label: 'Buying'"),
    ("label: 'Montado'", "label: 'Built'"),
    ("label: 'Vendido'", "label: 'Sold'"),
    ("Tem certeza que deseja excluir este PC?", "Delete this PC?"),
    ("Carregando estoque…", "Loading inventory…"),
    (">Estoque<", ">Inventory<"),
    ("PCs salvos", "Saved PCs"),
    ("Lucro realizado", "Realized profit"),
    (">Novo<", ">New<"),
    ("Todos ({builds.length})", "All ({builds.length})"),
    ("Nenhum PC neste estágio.", "No PCs in this stage."),
    ("Montar o primeiro", "Build your first"),
    ('aria-label="Alterar status"', 'aria-label="Change status"'),
    (">Planejando<", ">Planning<"),
    (">Comprando<", ">Buying<"),
    (">Montado<", ">Built<"),
    (">Vendido<", ">Sold<"),
    (">Custo<", ">Cost<"),
    (">Alvo<", ">Target<"),
    ("build.status === 'vendido' ? 'Lucro' : 'Margem'", "build.status === 'vendido' ? 'Profit' : 'Margin'"),
    (">Editar<", ">Edit<"),
    ('title="Excluir"', 'title="Delete"'),
]
for a, b in bp_repls:
    if a not in bp:
        print("MISSING builds:", repr(a)[:90])
    else:
        bp = bp.replace(a, b)
(ROOT / "app" / "builds" / "page.tsx").write_text(bp, encoding="utf-8")
print("builds ok")

# ad-generator
ad = (ROOT / "app" / "ad-generator" / "page.tsx").read_text(encoding="utf-8")
ad_repls = [
    ("label: 'Agressivo'", "label: 'Aggressive'"),
    ("hint: 'Venda rápida'", "hint: 'Quick sale'"),
    ("label: 'Premium'", "label: 'Premium'"),
    ("hint: 'Qualidade'", "hint: 'Quality'"),
    ("label: 'Direto'", "label: 'Direct'"),
    ("hint: 'Sem enrolação'", "hint: 'No fluff'"),
    ("'[Peça não selecionada]'", "'[Part not selected]'"),
    ("- Placa Mãe:", "- Motherboard:"),
    ("- Fonte:", "- PSU:"),
    ("- Gabinete:", "- Case:"),
    ("Formas de pagamento:", "Payment options:"),
    ("- À vista: R$", "- Cash: R$"),
    ("- 12x de R$", "- 12× of R$"),
    ("alert('Erro ao gerar anúncios')", "alert('Failed to generate ads')"),
    ("Gerador de anúncio", "Ad generator"),
    ("Setup atual:", "Current build:"),
    ("currentBuild.name || 'Novo PC'", "currentBuild.name || 'New PC'"),
    ("{filledCount}/9 peças ·", "{filledCount}/9 parts ·"),
    ("'Gerando…' : 'Gerar 3 tons'", "'Generating…' : 'Generate 3 tones'"),
    (
        "Monte um setup na{' '}",
        "Assemble a build on the{' '}",
    ),
    (">bancada<", ">workbench<"),
    ("antes de gerar o anúncio.", "before generating the ad."),
    (
        "Gere três tons de copy otimizados pra Mercado Livre e grupos — agressivo, premium e\n              direto.",
        "Generate three listing tones optimized for Mercado Livre and groups — aggressive, premium, and direct.",
    ),
    ("Escrevendo anúncios…", "Writing ads…"),
    ("Pronto pra colar", "Ready to paste"),
    ("'Copiado!' : 'Copiar'", "'Copied!' : 'Copy'"),
]
for a, b in ad_repls:
    if a not in ad:
        print("MISSING ad:", repr(a)[:100])
    else:
        ad = ad.replace(a, b)
(ROOT / "app" / "ad-generator" / "page.tsx").write_text(ad, encoding="utf-8")
print("ad ok")

# admin
admin = (ROOT / "app" / "admin" / "page.tsx").read_text(encoding="utf-8")
admin_repls = [
    ("setMessage('Banco populado com sucesso.')", "setMessage('Database seeded successfully.')"),
    ("setMessage('Erro: ' + msg)", "setMessage('Error: ' + msg)"),
    ("alert('Erro ao atualizar preço.')", "alert('Failed to update price.')"),
    (">Sistema<", ">System<"),
    ("Administração", "Administration"),
    ("Popular catálogo", "Seed catalog"),
    (
        "Insere peças de exemplo (Ryzen 5 5600, RX 9060 XT, etc.) e um PC pré-montado na sua\n              conta.",
        "Inserts sample parts (Ryzen 5 5600, RX 9060 XT, etc.) and a pre-built PC into your\n              account.",
    ),
    ("'Populando…' : 'Executar seed'", "'Seeding…' : 'Run seed'"),
    ("Peças · {parts.length}", "Parts · {parts.length}"),
    (">Peça<", ">Part<"),
    (">Cat.<", ">Cat.<"),
    (">Preço méd. (R$)<", ">Avg price (R$)<"),
    ("Nenhuma peça — rode o seed acima.", "No parts — run the seed above."),
]
for a, b in admin_repls:
    if a not in admin:
        print("MISSING admin:", repr(a)[:100])
    else:
        admin = admin.replace(a, b)
(ROOT / "app" / "admin" / "page.tsx").write_text(admin, encoding="utf-8")
print("admin ok")
