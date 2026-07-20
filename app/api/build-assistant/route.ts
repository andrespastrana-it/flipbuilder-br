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
Você é um assistente de montagem de PCs Gamer no Brasil, ajudando lojistas a planejar setups.
Você tem acesso ao seguinte catálogo de peças:
${JSON.stringify(catalog)}

REGRAS DE COMPATIBILIDADE (Siga estritamente):
1. Processadores AM4 (ex: Ryzen 5000) precisam de placa mãe AM4 e memória DDR4.
2. Processadores AM5 (ex: Ryzen 7000) precisam de placa mãe AM5 e memória DDR5.
3. A fonte (PSU) deve suportar a placa de vídeo.
4. O gabinete deve comportar a placa de vídeo.

Dê uma resposta natural, em português, analisando a solicitação do usuário e sugerindo peças baseadas no catálogo.
Se você sugerir uma build completa, preencha o campo "proposedBuild" no JSON de resposta. Use os IDs corretos do catálogo.

Formato de resposta OBRIGATÓRIO (JSON):
{
  "response": "Sua resposta explicativa e conversacional aqui",
  "proposedBuild": {
    "cpu": "id-do-cpu",
    "motherboard": "id-da-placa",
    "ram": "id-da-ram",
    "gpu": "id-da-gpu",
    "ssd": "id-do-ssd",
    "psu": "id-da-psu",
    "cooler": "id-do-cooler",
    "case": "id-do-case",
    "fans": "id-dos-fans"
  } // proposedBuild pode ser nulo se for apenas uma conversa sem uma build inteira
}
`;

    let conversationContext = "Histórico da conversa:\n";
    for (const msg of history) {
      conversationContext += `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.text}\n`;
    }
    conversationContext += `\nUsuário: ${prompt}`;

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
