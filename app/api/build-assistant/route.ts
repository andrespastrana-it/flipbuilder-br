import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export async function POST(req: Request) {
  try {
    const { prompt, history, catalog } = await req.json();

    const systemInstruction = `
You are a gaming PC build assistant for Brazil, helping resellers plan setups.
You have access to this parts catalog:
${JSON.stringify(catalog)}

COMPATIBILITY RULES (follow strictly):
1. AM4 processors (e.g. Ryzen 5000) need an AM4 motherboard and DDR4 memory.
2. AM5 processors (e.g. Ryzen 7000) need an AM5 motherboard and DDR5 memory.
3. The PSU must support the graphics card.
4. The case must fit the graphics card.

Reply naturally in English, analyzing the user's request and suggesting parts from the catalog.
If you suggest a full build, fill the "proposedBuild" field in the JSON response. Use correct catalog IDs.

REQUIRED response format (JSON):
{
  "response": "Your explanatory conversational reply here",
  "proposedBuild": {
    "cpu": "cpu-id",
    "motherboard": "mobo-id",
    "ram": "ram-id",
    "gpu": "gpu-id",
    "ssd": "ssd-id",
    "psu": "psu-id",
    "cooler": "cooler-id",
    "case": "case-id",
    "fans": "fans-id"
  } // proposedBuild may be null if this is just conversation without a full build
}
`;

    let conversationContext = "Conversation history:\n";
    for (const msg of history) {
      conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    }
    conversationContext += `\nUser: ${prompt}`;

    const res = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: conversationContext,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            proposedBuild: {
              type: Type.OBJECT,
              properties: {
                cpu: { type: Type.STRING },
                motherboard: { type: Type.STRING },
                ram: { type: Type.STRING },
                gpu: { type: Type.STRING },
                ssd: { type: Type.STRING },
                psu: { type: Type.STRING },
                cooler: { type: Type.STRING },
                case: { type: Type.STRING },
                fans: { type: Type.STRING },
              }
            }
          },
          required: ["response"]
        }
      }
    });

    const data = JSON.parse(res.text || "{}");

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Build assistant error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
