import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export async function POST(req: Request) {
  try {
    const { gpuName, buildSummary } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Busque o preço de venda de computadores (PCs Gamers) similares montados com a placa de vídeo "${gpuName}" no Brasil. 
Use a busca (Google Search) para encontrar cerca de 5 anúncios reais (ex: Mercado Livre, OLX, Facebook, etc).
Resuma os anúncios encontrados e estime um preço justo de venda para a seguinte configuração: ${buildSummary}
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comparables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  url: { type: Type.STRING }
                },
                required: ["title", "price", "url"]
              }
            },
            suggestedSellPrice: { type: Type.NUMBER }
          },
          required: ["comparables", "suggestedSellPrice"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Estimator error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
