import { createContext, useContext, useState, type ReactNode } from 'react';

interface ArchivedObjectsState {
  archivedCodes: Set<string>;
  archiveProject: (code: string) => void;
}

const ArchivedObjectsContext = createContext<ArchivedObjectsState | null>(null);

export const ArchivedObjectsProvider = ({ children }: { children: ReactNode }) => {
  const [archivedCodes, setArchivedCodes] = useState<Set<string>>(new Set());

  const value: ArchivedObjectsState = {
    archivedCodes,
    archiveProject: (code) => setArchivedCodes((prev) => new Set(prev).add(code)),
  };

  return <ArchivedObjectsContext.Provider value={value}>{children}</ArchivedObjectsContext.Provider>;
};

export const useArchivedObjects = () => {
  const ctx = useContext(ArchivedObjectsContext);
  if (!ctx) throw new Error('useArchivedObjects must be used within ArchivedObjectsProvider');
  return ctx;
};
