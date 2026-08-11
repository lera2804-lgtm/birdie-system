export interface WorkItem {
  title: string;
  qty?: string;
  pct: number;
}

// event.date is a full ISO date (YYYY-MM-DD) — carries its own year, so
// sorting/grouping never has to guess one.
export interface StageEvent {
  date: string;
  title: string;
}

export const compareEvents = (a: StageEvent, b: StageEvent): number => a.date.localeCompare(b.date);

export const sortEventsByDate = (events: StageEvent[]): StageEvent[] => [...events].sort(compareEvents);

const RU_MONTHS_NOMINATIVE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

// "2026-07-01" -> "Июль 2026" — the month/year group header events are
// bucketed under.
export const eventMonthLabel = (iso: string): string => {
  const [y, m] = iso.split('-').map(Number);
  return `${RU_MONTHS_NOMINATIVE[m - 1]} ${y}`;
};

// "2026-07-01" -> "01.07" — the compact display format used throughout
// the dashboard (timeline labels, event rows).
export const shortDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}.${m}`;
};

// Days elapsed since a stage's start (ISO) as of a given ISO report date —
// the "N-й день проекта" counter must move with the day being viewed, not
// stay fixed.
export const daysSinceStart = (start: string | null | undefined, reportDayISO: string): number | null => {
  if (!start) return null;
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ry, rm, rd] = reportDayISO.split('-').map(Number);
  const startDate = new Date(sy, sm - 1, sd);
  const targetDate = new Date(ry, rm - 1, rd);
  return Math.round((targetDate.getTime() - startDate.getTime()) / 86400000) + 1;
};

export interface ContractStage {
  code: string;
  title: string;
  readiness: number | null;
  updatedOn: string | null;
  active: boolean;
  position: number;
  start: string | null;
  meeting?: string | null;
  handover: string | null;
  today: string | null;
  extraMarkers?: string[];
  workItems: WorkItem[];
  factEvents: StageEvent[];
  planEvents: StageEvent[];
}

export const recomputeReadiness = (workItems: WorkItem[]): number | null => {
  if (workItems.length === 0) return null;
  return Math.round(workItems.reduce((acc, w) => acc + w.pct, 0) / workItems.length);
};
