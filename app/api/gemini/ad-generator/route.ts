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
      contents: `Create 3 ad copy options to sell a gaming PC with these specs:
${build}
Sell price: R$ ${price}

Desired variants:
1. "Aggressive" (FPS-focused, competitive gaming performance, urgency triggers)
2. "Premium" (aesthetics, part quality, professional assembly, warranty, discerning buyers)
3. "Direct" (bullet points, straight to the point — specs and price only, no fluff)

Return JSON. Write the ad texts in English.`,
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
