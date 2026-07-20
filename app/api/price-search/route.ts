import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export async function POST(req: Request) {
  try {
    const { partName } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Encontre o menor preço atualizado para a peça de computador: "${partName}". 
Busque EXCLUSIVAMENTE nestes sites: site:kabum.com.br OR site:terabyteshop.com.br OR site:pichau.com.br OR site:mercadolivre.com.br
Retorne os 4 resultados mais baratos que você encontrar.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  store: { type: Type.STRING, description: "Nome da loja em minúsculas (ex: kabum, terabyte, pichau, mercadolivre)" },
                  price: { type: Type.NUMBER, description: "Preço em Reais (BRL) - use formato numérico, ex: 1599.99" },
                  url: { type: Type.STRING, description: "URL direta do produto" },
                  inStock: { type: Type.BOOLEAN, description: "Se está em estoque" },
                },
                required: ["store", "price", "url", "inStock"]
              }
            }
          },
          required: ["results"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Price search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
