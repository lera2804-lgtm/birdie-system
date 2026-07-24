// Content ported from directions/sys-archive.jsx (ARCHIVE_KEY_FILES,
// ARCHIVE_ALL_FILES, ARCHIVE_MEDIA) — authored only for BIRDIE-10; other
// objects start with an empty archive (a real, honest state rather than
// invented content), same approach used for dashboard stages.

export type KeyFileStatus = 'утверждено' | 'в работе' | 'на согласовании';

export interface KeyFile {
  id: string;
  name: string;
  status: KeyFileStatus;
  album: string;
  date: string;
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

const BIRDIE_10_ARCHIVE: ArchiveData = {
  keyFiles: [
    { id: 'k1', name: 'Landscape concept', status: 'утверждено', album: 'альбом 3 / V5', date: '18.03.26' },
  ],
  allFiles: [
    { id: 'f1', type: 'PDF', name: 'Landscape concept / ORLOV.RED', album: '03', variant: 'V5', created: '18.03.26', uploaded: '19.03.26', key: true },
    { id: 'f2', type: 'PDF', name: 'Landscape concept / ORLOV.RED', album: '02', variant: 'V4', created: '10.03.26', uploaded: '11.03.26' },
    { id: 'f3', type: 'PDF', name: 'Landscape concept / ORLOV.RED', album: '01', variant: 'V1-3', created: '12.10.25', uploaded: '13.10.25' },
    { id: 'f4', type: 'ССЫЛКА', name: 'Благоустройство / Nature Form', album: 'F1', variant: '—', created: '01.06.25', uploaded: '12.10.25', driveUrl: 'https://disk.yandex.ru/f4' },
    { id: 'f5', type: 'ССЫЛКА', name: 'Благоустройство / Nature Form', album: 'F2', variant: '—', created: '01.06.25', uploaded: '10.03.26', driveUrl: 'https://disk.yandex.ru/f5' },
    { id: 'f6', type: 'PDF', name: 'Предконцепция / MOX', album: '01', variant: '—', created: '18.09.24', uploaded: '12.10.25', clientHidden: true },
    { id: 'f7', type: 'PDF', name: 'The gardens of Villa Komarov / MAKIA', album: '01', variant: '—', created: '15.07.20', uploaded: '12.10.25' },
    { id: 'f8', type: 'PDF', name: 'Design Development /.MAKIA', album: '01', variant: '—', created: '15.07.20', uploaded: '12.10.25' },
  ],
  media: [
    { id: 'm1', kind: 'Video', name: 'Landscape concept Alb.2 / V4', date: '10.03.26' },
    { id: 'm2', kind: 'Video', name: 'Landscape concept Alb.3 / V5', date: '18.03.26' },
    { id: 'm3', kind: 'AR tour', name: 'Concept Alb.4 / V13', date: '18.03.26' },
  ],
};

const EMPTY_ARCHIVE: ArchiveData = { keyFiles: [], allFiles: [], media: [] };

export const seedArchive = (projectCode: string): ArchiveData =>
  projectCode === 'BIRDIE-10'
    ? { keyFiles: [...BIRDIE_10_ARCHIVE.keyFiles], allFiles: [...BIRDIE_10_ARCHIVE.allFiles], media: [...BIRDIE_10_ARCHIVE.media] }
    : { keyFiles: [...EMPTY_ARCHIVE.keyFiles], allFiles: [...EMPTY_ARCHIVE.allFiles], media: [...EMPTY_ARCHIVE.media] };

export const ALLOWED_DOC_EXTENSIONS = ['pdf', 'dwg', 'xlsx', 'mp4'];
export const MAX_UPLOAD_MB = 500;
