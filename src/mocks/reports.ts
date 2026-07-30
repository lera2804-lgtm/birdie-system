// Content ported from directions/sys-reports.jsx REPORT_WEEKS / REPORT_MILESTONES
// / REPORT_DAY_GROUPS. June 2026 is the only month with authored data — other
// months naturally render the "empty month" state, which the design already
// covers (reports-empty artboard).

export const REPORT_MONTH = '2026-06';
export const REPORT_TODAY = '2026-06-30';

const pad = (n: number) => String(n).padStart(2, '0');

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

export const SUBPROJECTS = [
  { code: 'BIRDIE-10/6', title: 'Аудит ландшафт' },
  { code: 'BIRDIE-10/7', title: 'Уход деревья + дубы' },
];

let seq = 0;
const nid = (p: string) => `${p}${++seq}`;
const photosFor = (count: number): Photo[] => Array.from({ length: count }, () => ({ id: nid('p'), url: '' }));

// Ported 1:1 from REPORT_DAY_GROUPS (authored for 30.06.2026 in the design) —
// reused as the seed content for every published June day since no backend
// supplies unique per-day content in this demo.
export const makeTemplateReport = (date: string): DayReport => ({
  date,
  tasks: [
    { id: nid('t'), subproject: 'BIRDIE-10/7', kind: 'field', title: 'Обработка крон в северной части участка', photos: photosFor(4) },
    { id: nid('t'), subproject: 'BIRDIE-10/7', kind: 'field', title: 'Санитарная обрезка дубов у главного въезда', photos: photosFor(3) },
    { id: nid('t'), subproject: 'BIRDIE-10/7', kind: 'desk', title: 'Согласование сметы доп. работ с заказчиком', photos: [] },
    { id: nid('t'), subproject: 'BIRDIE-10/6', kind: 'desk', title: 'Передача итогового отчёта по аудиту в УК', photos: [] },
  ],
  frontOffice: [{ id: nid('o'), qty: '6', role: 'Рабочие / подрядчик' }],
  backOffice: [{ id: nid('o'), qty: '2', role: 'Инженеры / технологи' }],
  milestone: '',
});

export const emptyDraft = (date: string): DayReport => ({
  date,
  tasks: [],
  frontOffice: [],
  backOffice: [],
  milestone: '',
});

const HAS_REPORT_DAYS = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30];

const MILESTONES: Record<number, { text: string; tag: string }> = {
  1: { text: 'Старт этапа «Уход за деревьями + дубы».', tag: 'фотоотчёт' },
  10: { text: 'Завершён первый этап работ по уходу.', tag: '14 фото' },
  19: { text: 'Очная встреча с заказчиком на площадке.', tag: 'встреча' },
  24: { text: 'Сдан подряд BIRDIE-10/6 (аудит ландшафта).', tag: 'документы' },
};

// Seed data for June 2026 — the only month this demo has authored content
// for. Returned as a fresh Record each call so callers can own mutable state.
export const seedJune2026Reports = (): Record<string, DayReport> => {
  const out: Record<string, DayReport> = {};
  for (const day of HAS_REPORT_DAYS) {
    const date = `${REPORT_MONTH}-${pad(day)}`;
    const report = makeTemplateReport(date);
    const milestone = MILESTONES[day];
    if (milestone) {
      report.milestone = milestone.text;
      report.milestoneTag = milestone.tag;
    }
    out[date] = report;
  }
  return out;
};
