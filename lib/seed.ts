import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { Part, Build } from "./types";

export const seedParts: Part[] = [
  {
    id: "cpu-5600",
    category: "cpu",
    name: "AMD Ryzen 5 5600",
    brand: "AMD",
    socket: "AM4",
    imageUrl: "https://picsum.photos/seed/5600/200",
    priceMin: 800,
    priceAvg: 850,
    priceMax: 900,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ryzen-5-5600",
      terabyte: "https://www.terabyteshop.com.br/busca?str=ryzen+5+5600",
      pichau: "https://www.pichau.com.br/search?q=ryzen%205%205600",
      mercadoLivre: "https://lista.mercadolivre.com.br/ryzen-5-5600",
    },
    alternatives: [
      { partId: "cpu-4600g", priceDelta: -200 },
      { partId: "cpu-5700x", priceDelta: 350 },
    ],
  },
  {
    id: "cpu-4600g",
    category: "cpu",
    name: "AMD Ryzen 5 4600G",
    brand: "AMD",
    socket: "AM4",
    imageUrl: "https://picsum.photos/seed/4600g/200",
    priceMin: 600,
    priceAvg: 650,
    priceMax: 700,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ryzen-5-4600g",
    },
    alternatives: [],
  },
  {
    id: "cpu-5700x",
    category: "cpu",
    name: "AMD Ryzen 7 5700X",
    brand: "AMD",
    socket: "AM4",
    imageUrl: "https://picsum.photos/seed/5700x/200",
    priceMin: 1100,
    priceAvg: 1200,
    priceMax: 1300,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ryzen-7-5700x",
    },
    alternatives: [],
  },
  {
    id: "cpu-7600",
    category: "cpu",
    name: "AMD Ryzen 5 7600",
    brand: "AMD",
    socket: "AM5",
    imageUrl: "https://picsum.photos/seed/7600/200",
    priceMin: 1300,
    priceAvg: 1400,
    priceMax: 1500,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ryzen-5-7600",
    },
    alternatives: [],
  },
  {
    id: "mobo-b550m",
    category: "motherboard",
    name: "B550M Aorus Elite Motherboard",
    brand: "Gigabyte",
    socket: "AM4",
    ramType: "DDR4",
    imageUrl: "https://picsum.photos/seed/b550m/200",
    priceMin: 700,
    priceAvg: 750,
    priceMax: 850,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/b550m-aorus",
    },
    alternatives: [],
  },
  {
    id: "mobo-b650m",
    category: "motherboard",
    name: "B650M TUF Gaming Motherboard",
    brand: "ASUS",
    socket: "AM5",
    ramType: "DDR5",
    imageUrl: "https://picsum.photos/seed/b650m/200",
    priceMin: 1200,
    priceAvg: 1300,
    priceMax: 1400,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/b650m-tuf",
    },
    alternatives: [],
  },
  {
    id: "ram-ddr4-3200",
    category: "ram",
    name: "Kingston Fury Beast 16GB (2x8) DDR4 3200MHz Memory",
    brand: "Kingston",
    ramType: "DDR4",
    imageUrl: "https://picsum.photos/seed/ddr4-3200/200",
    priceMin: 280,
    priceAvg: 300,
    priceMax: 350,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ddr4-3200-16gb",
    },
    alternatives: [],
  },
  {
    id: "ram-ddr5-6000",
    category: "ram",
    name: "Corsair Vengeance 32GB (2x16) DDR5 6000MHz Memory",
    brand: "Corsair",
    ramType: "DDR5",
    imageUrl: "https://picsum.photos/seed/ddr5-6000/200",
    priceMin: 800,
    priceAvg: 850,
    priceMax: 950,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ddr5-6000-32gb",
    },
    alternatives: [],
  },
  {
    id: "gpu-9060xt",
    category: "gpu",
    name: "Radeon RX 9060 XT 16GB Gigabyte Gaming OC",
    brand: "Gigabyte",
    lengthMm: 282,
    imageUrl: "https://picsum.photos/seed/9060xt/200",
    priceMin: 1800,
    priceAvg: 1950,
    priceMax: 2100,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/rx-9060-xt",
    },
    alternatives: [],
  },
  {
    id: "gpu-5060",
    category: "gpu",
    name: "GeForce RTX 5060 8GB ASUS Dual",
    brand: "ASUS",
    lengthMm: 227,
    imageUrl: "https://picsum.photos/seed/5060/200",
    priceMin: 2000,
    priceAvg: 2150,
    priceMax: 2300,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/rtx-5060",
    },
    alternatives: [],
  },
  {
    id: "gpu-5070",
    category: "gpu",
    name: "GeForce RTX 5070 12GB MSI Ventus",
    brand: "MSI",
    lengthMm: 308,
    imageUrl: "https://picsum.photos/seed/5070/200",
    priceMin: 3500,
    priceAvg: 3700,
    priceMax: 3900,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/rtx-5070",
    },
    alternatives: [],
  },
  {
    id: "ssd-1tb",
    category: "ssd",
    name: "SSD 1TB Kingston NV2 M.2 NVMe",
    brand: "Kingston",
    imageUrl: "https://picsum.photos/seed/nvme1tb/200",
    priceMin: 350,
    priceAvg: 380,
    priceMax: 420,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ssd-1tb-nvme",
    },
    alternatives: [],
  },
  {
    id: "ssd-2tb",
    category: "ssd",
    name: "SSD 2TB WD Blue SN580 M.2 NVMe",
    brand: "Western Digital",
    imageUrl: "https://picsum.photos/seed/nvme2tb/200",
    priceMin: 700,
    priceAvg: 750,
    priceMax: 800,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/ssd-2tb-nvme",
    },
    alternatives: [],
  },
  {
    id: "psu-650w",
    category: "psu",
    name: "MSI MAG A650BN 650W Bronze PSU",
    brand: "MSI",
    wattage: 650,
    imageUrl: "https://picsum.photos/seed/650w/200",
    priceMin: 280,
    priceAvg: 300,
    priceMax: 340,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/fonte-650w",
    },
    alternatives: [],
  },
  {
    id: "psu-750w",
    category: "psu",
    name: "Corsair CX750M 750W Bronze PSU",
    brand: "Corsair",
    wattage: 750,
    imageUrl: "https://picsum.photos/seed/750w/200",
    priceMin: 450,
    priceAvg: 480,
    priceMax: 520,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/fonte-750w",
    },
    alternatives: [],
  },
  {
    id: "cooler-ag400",
    category: "cooler",
    name: "Cooler DeepCool AG400 ARGB",
    brand: "DeepCool",
    imageUrl: "https://picsum.photos/seed/ag400/200",
    priceMin: 150,
    priceAvg: 165,
    priceMax: 180,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/cooler-ag400",
    },
    alternatives: [],
  },
  {
    id: "case-white",
    category: "case",
    name: "Montech Air 903 Max White Mesh Case",
    brand: "Montech",
    imageUrl: "https://picsum.photos/seed/casewhite/200",
    priceMin: 350,
    priceAvg: 380,
    priceMax: 450,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/gabinete-white-mesh",
    },
    alternatives: [],
  },
  {
    id: "fans-argb",
    category: "fans",
    name: "Aigo ARGB 120mm White Fan Kit (3)",
    brand: "Aigo",
    imageUrl: "https://picsum.photos/seed/fansargb/200",
    priceMin: 100,
    priceAvg: 120,
    priceMax: 150,
    storeLinks: {
      kabum: "https://www.kabum.com.br/busca/kit-fan-argb",
    },
    alternatives: [],
  },
];

export async function runSeed(userId: string) {
  const batch = writeBatch(db);

  for (const part of seedParts) {
    const docRef = doc(db, "parts", part.id);
    batch.set(docRef, part);
  }

  const exampleBuildId = "build-example";
  const exampleBuild: Build = {
    id: exampleBuildId,
    name: "Setup RX 9060 XT White RGB",
    thumbnail: "https://picsum.photos/seed/casewhite/200",
    totalCost: 4895, // calculated approx
    targetSellPrice: 5990,
    status: "planejando",
    userId,
    aestheticMultiplier: true,
    markupPercent: 20,
    createdAt: Date.now(),
    parts: {
      cpu: { partId: "cpu-5600", actualPaid: 850 },
      motherboard: { partId: "mobo-b550m", actualPaid: 750 },
      ram: { partId: "ram-ddr4-3200", actualPaid: 300 },
      gpu: { partId: "gpu-9060xt", actualPaid: 1950 },
      ssd: { partId: "ssd-1tb", actualPaid: 380 },
      psu: { partId: "psu-650w", actualPaid: 300 },
      cooler: { partId: "cooler-ag400", actualPaid: 165 },
      case: { partId: "case-white", actualPaid: 380 },
      fans: { partId: "fans-argb", actualPaid: 120 },
    },
  };

  const buildRef = doc(db, "builds", exampleBuildId);
  batch.set(buildRef, exampleBuild);

  await batch.commit();
}
