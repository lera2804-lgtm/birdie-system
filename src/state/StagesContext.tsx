import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PROJECT_STAGES, type ContractStage } from '../mocks/dashboard';

interface StagesState {
  stages: ContractStage[];
  addStage: (stage: ContractStage) => void;
  replaceStage: (code: string, next: ContractStage) => void;
  removeStage: (code: string) => void;
}

const StagesContext = createContext<StagesState | null>(null);

export const StagesProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [stages, setStages] = useState<ContractStage[]>(() => (PROJECT_STAGES[projectCode] || []).map((s) => ({ ...s })));

  useEffect(() => {
    setStages((PROJECT_STAGES[projectCode] || []).map((s) => ({ ...s })));
  }, [projectCode]);

  const value: StagesState = {
    stages,
    addStage: (stage) => setStages((prev) => [...prev, stage]),
    replaceStage: (code, next) => setStages((prev) => prev.map((s) => (s.code === code ? next : s))),
    removeStage: (code) => setStages((prev) => prev.filter((s) => s.code !== code)),
  };

  return <StagesContext.Provider value={value}>{children}</StagesContext.Provider>;
};

export const useStages = () => {
  const ctx = useContext(StagesContext);
  if (!ctx) throw new Error('useStages must be used within StagesProvider');
  return ctx;
};
