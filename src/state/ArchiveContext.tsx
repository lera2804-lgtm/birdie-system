import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseShortDate, seedArchive, type ArchiveData, type ArchiveFile, type MediaItem } from '../mocks/archive';

interface ArchiveState extends ArchiveData {
  addFile: (file: ArchiveFile) => void;
  updateFile: (id: string, patch: Partial<ArchiveFile>) => void;
  removeFile: (id: string) => void;
  toggleHidden: (id: string) => void;
  addMedia: (media: MediaItem) => void;
  updateMedia: (id: string, patch: Partial<MediaItem>) => void;
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
    addFile: (file) => setData((d) => {
      const allFiles = [...d.allFiles, file].sort((a, b) => parseShortDate(b.created) - parseShortDate(a.created));
      const keyFiles = file.key
        ? [...d.keyFiles, { id: file.id, name: file.name, status: 'на согласовании' as const, album: `альбом ${file.album} / ${file.variant}`, date: file.created }]
            .sort((a, b) => parseShortDate(b.date) - parseShortDate(a.date))
        : d.keyFiles;
      return { ...d, allFiles, keyFiles };
    }),
    updateFile: (id, patch) => setData((d) => ({ ...d, allFiles: d.allFiles.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
    removeFile: (id) => setData((d) => ({ ...d, allFiles: d.allFiles.filter((f) => f.id !== id), keyFiles: d.keyFiles.filter((k) => k.id !== id) })),
    toggleHidden: (id) => setData((d) => ({ ...d, allFiles: d.allFiles.map((f) => (f.id === id ? { ...f, clientHidden: !f.clientHidden } : f)) })),
    addMedia: (media) => setData((d) => ({ ...d, media: [...d.media, media].sort((a, b) => parseShortDate(b.date) - parseShortDate(a.date)) })),
    updateMedia: (id, patch) => setData((d) => ({ ...d, media: d.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    removeMedia: (id) => setData((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) })),
  };

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
};

export const useArchive = () => {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider');
  return ctx;
};
