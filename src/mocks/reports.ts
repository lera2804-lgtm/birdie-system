const pad = (n: number) => String(n).padStart(2, '0');

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const currentMonth = () => todayISO().slice(0, 7);

export const daysInMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

export const monthLabel = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  const genitive = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const nominative = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  return { nominative: `${nominative[m - 1]} ${y}`, monthOnly: nominative[m - 1], genitive: genitive[m - 1] };
};

export const shiftMonth = (month: string, delta: number) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const addDays = (date: string, delta: number) => {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

export const weekdayIdx = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7; // 0 = Monday
};

export const weekdayShort = (date: string) => ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][weekdayIdx(date)];

export interface GridCell {
  date: string;
  dayNum: number;
  inMonth: boolean;
}

// Always full weeks (Monday-start), with faded leading/trailing days from
// neighboring months so any month lines up correctly under the weekday header.
export const monthGrid = (month: string): GridCell[] => {
  const first = `${month}-01`;
  const leading = weekdayIdx(first);
  const total = daysInMonth(month);
  const start = addDays(first, -leading);
  const weeks = Math.ceil((leading + total) / 7);
  const cellCount = weeks * 7;
  return Array.from({ length: cellCount }, (_, i) => {
    const date = addDays(start, i);
    return { date, dayNum: Number(date.split('-')[2]), inMonth: date.slice(0, 7) === month };
  });
};

export const formatShort = (date: string) => {
  const [, m, d] = date.split('-');
  return `${d}.${m}`;
};

export const formatLong = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  const names = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${d} ${names[m - 1]} ${y}`;
};

export type TaskKind = 'field' | 'desk';

export interface Photo {
  id: string;
  url: string;
  uploading?: boolean;
}

export interface ReportTask {
  id: string;
  subproject: string;
  kind: TaskKind;
  title: string;
  photos: Photo[];
}

export interface OfficeRow {
  id: string;
  qty: string;
  role: string;
}

export interface DayReport {
  date: string;
  tasks: ReportTask[];
  frontOffice: OfficeRow[];
  backOffice: OfficeRow[];
  milestone: string;
  milestoneTag?: string;
  editedByPM?: string;
  isDraft?: boolean;
}
