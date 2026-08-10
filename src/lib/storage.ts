import { supabase } from './supabaseClient';

const randomId = () => Math.random().toString(36).slice(2);

// Storage paths are opaque by design (see the RLS comment in
// 0002_storage.sql) — dropping the original filename instead of appending
// it avoids public URLs breaking on names with spaces/Cyrillic/etc, which
// getPublicUrl doesn't reliably encode.
const extOf = (filename: string) => {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '');
};

const upload = async (bucket: string, path: string, file: File): Promise<{ url: string | null; path: string | null; error: string | null }> => {
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return { url: null, path: null, error: error.message };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path, error: null };
};

export const publicUrl = (bucket: string, path: string): string =>
  supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

// Path is prefixed with the object code so storage RLS policies can gate
// access per-object the same way the database tables do.
export const uploadReportPhoto = (objectCode: string, reportDate: string, file: File) =>
  upload('report-photos', `${objectCode}/${reportDate}/${randomId()}${extOf(file.name)}`, file);

export const uploadCover = (objectCode: string, file: File) =>
  upload('covers', `${objectCode}/${randomId()}${extOf(file.name)}`, file);

// Extracts the storage path from a public URL previously returned by
// getPublicUrl, so cleanup calls can pass it to storage.remove().
export const pathFromPublicUrl = (bucket: string, url: string): string | null => {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
};
