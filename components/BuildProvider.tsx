'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Build, Category, BuildPart } from '@/lib/types';

interface BuildContextType {
  currentBuild: Partial<Build>;
  setCurrentBuild: (build: Partial<Build>) => void;
  updatePart: (category: Category, part: BuildPart | null) => void;
}

const BuildContext = createContext<BuildContextType>({
  currentBuild: {},
  setCurrentBuild: () => {},
  updatePart: () => {},
});

export const useBuild = () => useContext(BuildContext);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [currentBuild, setCurrentBuild] = useState<Partial<Build>>({
    name: "New PC",
    status: "planejando",
    aestheticMultiplier: false,
    markupPercent: 20,
    parts: {
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      ssd: null,
      psu: null,
      cooler: null,
      case: null,
      fans: null,
    }
  });

  const updatePart = (category: Category, part: BuildPart | null) => {
    setCurrentBuild(prev => ({
      ...prev,
      parts: {
        ...(prev.parts as any),
        [category]: part
      }
    }));
  };

  return (
    <BuildContext.Provider value={{ currentBuild, setCurrentBuild, updatePart }}>
      {children}
    </BuildContext.Provider>
  );
}
