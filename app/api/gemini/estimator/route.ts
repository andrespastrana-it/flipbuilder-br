import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
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
      contents: `Estimate a fair SELL price (in BRL) for a pre-built gaming PC in Brazil built around the graphics card "${gpuName}".
Use Google Search to find about 5 real, RECENT listings of comparable pre-built PCs (Mercado Livre, OLX, Facebook Marketplace, etc.).
Rules:
- Compare against configs with a similar GPU tier and overall spec to: ${buildSummary}
- Use the à vista (cash) price; ignore installment totals.
- Discard obvious outliers (broken, parts-only, or scam listings) before estimating.
- "suggestedSellPrice" should be a realistic, competitive à vista asking price for a quick flip — not a wishful maximum.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        temperature: 0.2,
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
