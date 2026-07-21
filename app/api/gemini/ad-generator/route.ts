import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export async function POST(req: Request) {
  try {
    const { build, price } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Crie 3 opções de anúncio para vender um PC gamer com estas specs:
${build}
Preço de venda: R$ ${price}

Variantes desejadas:
1. "Agressivo" (foco em FPS, desempenho competitivo, gatilhos de urgência)
2. "Premium" (estética, qualidade das peças, montagem profissional, garantia, comprador exigente)
3. "Direto" (bullet points, direto ao ponto — specs e preço, sem enrolação)

Escreva os anúncios em português do Brasil, com tom natural para Mercado Livre / OLX / Facebook Marketplace.
Não invente specs que não estejam na lista acima. Retorne JSON.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agressivo: { type: Type.STRING },
            premium: { type: Type.STRING },
            direto: { type: Type.STRING }
          },
          required: ["agressivo", "premium", "direto"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Ad generator error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
