import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { seedArchive, type ArchiveData, type ArchiveFile, type MediaItem } from '../mocks/archive';

interface ArchiveState extends ArchiveData {
  addFile: (file: ArchiveFile) => void;
  removeFile: (id: string) => void;
  toggleHidden: (id: string) => void;
  addMedia: (media: MediaItem) => void;
  removeMedia: (id: string) => void;
}

const ArchiveContext = createContext<ArchiveState | null>(null);

export const ArchiveProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [data, setData] = useState<ArchiveData>(() => seedArchive(projectCode));

  useEffect(() => {
    setData(seedArchive(projectCode));
  }, [projectCode]);

  const value: ArchiveState = {
    ...data,
    addFile: (file) => setData((d) => ({ ...d, allFiles: [file, ...d.allFiles], keyFiles: file.key ? [{ id: file.id, name: file.name, status: 'на согласовании', album: `альбом ${file.album} / ${file.variant}`, date: file.created }, ...d.keyFiles] : d.keyFiles })),
    removeFile: (id) => setData((d) => ({ ...d, allFiles: d.allFiles.filter((f) => f.id !== id), keyFiles: d.keyFiles.filter((k) => k.id !== id) })),
    toggleHidden: (id) => setData((d) => ({ ...d, allFiles: d.allFiles.map((f) => (f.id === id ? { ...f, clientHidden: !f.clientHidden } : f)) })),
    addMedia: (media) => setData((d) => ({ ...d, media: [media, ...d.media] })),
    removeMedia: (id) => setData((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) })),
  };

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};

export const useArchive = () => {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider');
  return ctx;
};
