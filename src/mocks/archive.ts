export type KeyFileStatus = 'утверждено' | 'в работе' | 'на согласовании';

export interface KeyFile {
  id: string;
  name: string;
  status: KeyFileStatus;
  album: string;
  date: string;
  driveUrl?: string;
}

export interface ArchiveFile {
  id: string;
  type: string;
  name: string;
  album: string;
  variant: string;
  created: string;
  uploaded: string;
  key?: boolean;
  keyStatus?: KeyFileStatus;
  clientHidden?: boolean;
  driveUrl?: string;
}

// Sort key from a "DD.MM.YY" date string — monotonic integer, not a real
// Date, so century assumptions (20YY) and timezones never come into play.
export const parseShortDate = (s: string): number => {
  const [d, m, y] = s.split('.').map(Number);
  return (2000 + (y || 0)) * 372 + (m || 0) * 31 + (d || 0);
};

// Converts an <input type="date"> value ("YYYY-MM-DD") to the archive's
// display format ("DD.MM.YY").
export const toShortDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y.slice(2)}`;
};

// Reverse of toShortDate — for seeding an <input type="date"> from a stored
// "DD.MM.YY" value.
export const fromShortDate = (s: string): string => {
  const [d, m, y] = s.split('.');
  return `20${y}-${m}-${d}`;
};

export type MediaKind = 'Video' | 'AR tour' | '3D';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  name: string;
  date: string;
  driveUrl?: string;
}

export interface ArchiveData {
  keyFiles: KeyFile[];
  allFiles: ArchiveFile[];
  media: MediaItem[];
}

export const ALLOWED_DOC_EXTENSIONS = ['pdf', 'dwg', 'xlsx', 'mp4'];
export const MAX_UPLOAD_MB = 500;
