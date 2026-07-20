import { GoogleGenAI, Type } from "@google/genai";
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
      contents: `
Crie 3 opções de textos de anúncio (copy) para vender um PC Gamer com as seguintes especificações:
${build}
Preço de venda: R$ ${price}

Variantes desejadas:
1. "Agressivo" (Focado em FPS, performance em jogos competitivos, gatilhos de urgência)
2. "Premium" (Focado em estética, qualidade das peças, montagem profissional, garantia, público exigente)
3. "Direto" (Bullet points, direto ao ponto, apenas especificações e preço, sem muita enrolação)

Retorne em formato JSON.`,
      config: {
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
