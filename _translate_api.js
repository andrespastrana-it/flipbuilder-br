const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content, "utf8");
  console.log("wrote", file);
}

const adPrompt = `Create 3 ad copy options to sell a gaming PC with these specs:
\${build}
Sell price: R$ \${price}

Desired variants:
1. "Aggressive" (FPS-focused, competitive gaming performance, urgency triggers)
2. "Premium" (aesthetics, part quality, professional assembly, warranty, discerning buyers)
3. "Direct" (bullet points, straight to the point — specs and price only, no fluff)

Return JSON format.`;

// We'll use template carefully - better to rewrite full files

const adGeneratorBody = `import { GoogleGenAI, Type } from "@google/genai";
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
      contents: \`Create 3 ad copy options to sell a gaming PC with these specs:
\${build}
Sell price: R$ \${price}

Desired variants:
1. "Aggressive" (FPS-focused, competitive gaming performance, urgency triggers)
2. "Premium" (aesthetics, part quality, professional assembly, warranty, discerning buyers)
3. "Direct" (bullet points, straight to the point — specs and price only, no fluff)

Return JSON. Write the ad texts in English.\`,
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
`;

const buildAssistantBody = `import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export async function POST(req: Request) {
  try {
    const { prompt, history, catalog } = await req.json();

    const systemInstruction = \`
You are a gaming PC build assistant for Brazil, helping resellers plan setups.
You have access to this parts catalog:
\${JSON.stringify(catalog)}

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
\`;

    let conversationContext = "Conversation history:\\n";
    for (const msg of history) {
      conversationContext += \`\${msg.role === 'user' ? 'User' : 'Assistant'}: \${msg.text}\\n\`;
    }
    conversationContext += \`\\nUser: \${prompt}\`;

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
`;

const estimatorBody = `import { GoogleGenAI, Type } from "@google/genai";
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
      contents: \`Search for the sell price of similar pre-built gaming PCs with the graphics card "\${gpuName}" in Brazil.
Use Google Search to find about 5 real listings (e.g. Mercado Livre, OLX, Facebook, etc).
Summarize the listings found and estimate a fair sell price for this configuration: \${buildSummary}
      \`,
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
`;

const priceSearchBody = `import { GoogleGenAI, Type } from "@google/genai";
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
      contents: \`Find the lowest current price for this PC part: "\${partName}".
Search EXCLUSIVELY on these sites: site:kabum.com.br OR site:terabyteshop.com.br OR site:pichau.com.br OR site:mercadolivre.com.br
Return the 4 cheapest results you find.\`,
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
`;

const files = [
  ["app/api/gemini/ad-generator/route.ts", adGeneratorBody],
  ["app/api/ad-generator/route.ts", adGeneratorBody],
  ["app/api/gemini/build-assistant/route.ts", buildAssistantBody],
  ["app/api/build-assistant/route.ts", buildAssistantBody],
  ["app/api/gemini/estimator/route.ts", estimatorBody],
  ["app/api/estimator/route.ts", estimatorBody],
  ["app/api/gemini/price-search/route.ts", priceSearchBody],
  ["app/api/price-search/route.ts", priceSearchBody],
];

for (const [f, body] of files) write(f, body);
console.log("APIs done");
