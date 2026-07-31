import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fromShortDate, toShortDate, type ArchiveData, type ArchiveFile, type KeyFile, type MediaItem } from '../mocks/archive';

interface ArchiveState extends ArchiveData {
  loading: boolean;
  addFile: (file: ArchiveFile) => Promise<{ error: string | null }>;
  updateFile: (id: string, patch: Partial<ArchiveFile>) => Promise<{ error: string | null }>;
  removeFile: (id: string) => Promise<{ error: string | null }>;
  toggleHidden: (id: string) => Promise<{ error: string | null }>;
  addMedia: (media: MediaItem) => Promise<{ error: string | null }>;
  updateMedia: (id: string, patch: Partial<MediaItem>) => Promise<{ error: string | null }>;
  removeMedia: (id: string) => Promise<{ error: string | null }>;
}

const ArchiveContext = createContext<ArchiveState | null>(null);

interface FileRow {
  id: string;
  type: string;
  name: string;
  album: string;
  variant: string;
  created_date: string;
  uploaded_date: string;
  is_key: boolean;
  key_status: string | null;
  client_hidden: boolean;
  drive_url: string | null;
}

interface MediaRow {
  id: string;
  kind: string;
  name: string;
  item_date: string;
  drive_url: string | null;
}

const fileFromRow = (r: FileRow): ArchiveFile => ({
  id: r.id,
  type: r.type,
  name: r.name,
  album: r.album,
  variant: r.variant,
  created: toShortDate(r.created_date),
  uploaded: toShortDate(r.uploaded_date),
  key: r.is_key,
  keyStatus: (r.key_status as ArchiveFile['keyStatus']) ?? undefined,
  clientHidden: r.client_hidden,
  driveUrl: r.drive_url ?? undefined,
});

const mediaFromRow = (r: MediaRow): MediaItem => ({
  id: r.id,
  kind: r.kind as MediaItem['kind'],
  name: r.name,
  date: toShortDate(r.item_date),
  driveUrl: r.drive_url ?? undefined,
});

const keyFilesFrom = (allFiles: ArchiveFile[]): KeyFile[] =>
  allFiles
    .filter((f) => f.key)
    .map((f) => ({ id: f.id, name: f.name, status: f.keyStatus ?? 'на согласовании', album: `альбом ${f.album} / ${f.variant}`, date: f.created }));

export const ArchiveProvider = ({ projectCode, children }: { projectCode: string; children: ReactNode }) => {
  const [allFiles, setAllFiles] = useState<ArchiveFile[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [filesRes, mediaRes] = await Promise.all([
      supabase.from('archive_files').select('id, type, name, album, variant, created_date, uploaded_date, is_key, key_status, client_hidden, drive_url').eq('object_code', projectCode),
      supabase.from('media_items').select('id, kind, name, item_date, drive_url').eq('object_code', projectCode),
    ]);
    setAllFiles((filesRes.data ?? []).map(fileFromRow));
    setMedia((mediaRes.data ?? []).map(mediaFromRow));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCode]);

  const addFile = async (file: ArchiveFile) => {
    const { error } = await supabase.from('archive_files').insert({
      object_code: projectCode,
      type: file.type,
      name: file.name,
      album: file.album,
      variant: file.variant,
      created_date: fromShortDate(file.created),
      is_key: !!file.key,
      key_status: file.keyStatus ?? null,
      client_hidden: !!file.clientHidden,
      drive_url: file.driveUrl ?? null,
    });
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  // Applied to local state immediately (these back free-text inputs that
  // fire on every keystroke) — a full reload-per-keystroke round trip would
  // make typing feel broken. The write to Supabase happens in the background.
  const updateFile = async (id: string, patch: Partial<ArchiveFile>) => {
    setAllFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.album !== undefined) payload.album = patch.album;
    if (patch.variant !== undefined) payload.variant = patch.variant;
    if (patch.created !== undefined) payload.created_date = fromShortDate(patch.created);
    if (patch.key !== undefined) payload.is_key = patch.key;
    if (patch.keyStatus !== undefined) payload.key_status = patch.keyStatus;
    if (patch.clientHidden !== undefined) payload.client_hidden = patch.clientHidden;
    if (patch.driveUrl !== undefined) payload.drive_url = patch.driveUrl;
    const { error } = await supabase.from('archive_files').update(payload).eq('id', id);
    return { error: error?.message ?? null };
  };

  const removeFile = async (id: string) => {
    const { error } = await supabase.from('archive_files').delete().eq('id', id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  const toggleHidden = async (id: string) => {
    const current = allFiles.find((f) => f.id === id);
    if (!current) return { error: null };
    return updateFile(id, { clientHidden: !current.clientHidden });
  };

  const addMedia = async (item: MediaItem) => {
    const { error } = await supabase.from('media_items').insert({
      object_code: projectCode,
      kind: item.kind,
      name: item.name,
      item_date: fromShortDate(item.date),
      drive_url: item.driveUrl ?? null,
    });
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  const updateMedia = async (id: string, patch: Partial<MediaItem>) => {
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const payload: Record<string, unknown> = {};
    if (patch.kind !== undefined) payload.kind = patch.kind;
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.date !== undefined) payload.item_date = fromShortDate(patch.date);
    if (patch.driveUrl !== undefined) payload.drive_url = patch.driveUrl;
    const { error } = await supabase.from('media_items').update(payload).eq('id', id);
    return { error: error?.message ?? null };
  };

  const removeMedia = async (id: string) => {
    const { error } = await supabase.from('media_items').delete().eq('id', id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  return (
    <ArchiveContext.Provider
      value={{ keyFiles: keyFilesFrom(allFiles), allFiles, media, loading, addFile, updateFile, removeFile, toggleHidden, addMedia, updateMedia, removeMedia }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};

export const useArchive = () => {
  const ctx = useContext(ArchiveContext);
  if (!ctx) throw new Error('useArchive must be used within ArchiveProvider');
  return ctx;
};
