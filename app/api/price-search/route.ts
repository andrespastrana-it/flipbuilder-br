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
      contents: `Find the lowest current price for this PC part: "${partName}".
Search EXCLUSIVELY on these sites: site:kabum.com.br OR site:terabyteshop.com.br OR site:pichau.com.br OR site:mercadolivre.com.br
Return the 4 cheapest results you find.`,
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
                  store: { type: Type.STRING, description: "Store name in lowercase (e.g. kabum, terabyte, pichau, mercadolivre)" },
                  price: { type: Type.NUMBER, description: "Price in BRL — numeric format, e.g. 1599.99" },
                  url: { type: Type.STRING, description: "Direct product URL" },
                  inStock: { type: Type.BOOLEAN, description: "Whether it is in stock" },
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
