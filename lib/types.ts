export type Category = 
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'ssd'
  | 'psu'
  | 'cooler'
  | 'case'
  | 'fans';

export interface Part {
  id: string;
  category: Category;
  name: string;
  brand: string;
  socket?: string;
  ramType?: string;
  wattage?: number;
  lengthMm?: number;
  imageUrl: string;
  priceMin: number;
  priceAvg: number;
  priceMax: number;
  storeLinks: {
    kabum?: string;
    terabyte?: string;
    pichau?: string;
    mercadoLivre?: string;
  };
  alternatives: {
    partId: string;
    priceDelta: number;
  }[];
  lastUpdated?: number;
  priceHistory?: { date: number; price: number }[];
}

export interface BuildPart {
  partId: string;
  actualPaid: number;
}

export type BuildStatus = 'planejando' | 'comprando' | 'montado' | 'vendido';

export interface Build {
  id: string;
  name: string;
  thumbnail: string;
  totalCost: number;
  targetSellPrice: number;
  actualSellPrice?: number;
  status: BuildStatus;
  userId: string;
  parts: Record<Category, BuildPart | null>;
  aestheticMultiplier: boolean;
  markupPercent: number;
  createdAt: number;
  chatHistory?: { role: 'user'|'assistant', text: string }[];
}
