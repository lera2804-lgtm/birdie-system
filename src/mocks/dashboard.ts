export interface WorkItem {
  title: string;
  qty?: string;
  pct: number;
}

export interface StageEvent {
  month: string;
  date: string;
  title: string;
}

export interface ContractStage {
  code: string;
  title: string;
  readiness: number | null;
  updatedOn: string | null;
  active: boolean;
  start: string | null;
  meeting?: string;
  handover: string | null;
  today: string | null;
  extraMarkers?: string[];
  workItems: WorkItem[];
  factEvents: StageEvent[];
  planEvents: StageEvent[];
}

// Content ported 1:1 from orlov.red/birdie-10/dashboard (per chat2 screenshots).
const BIRDIE_10_STAGES: ContractStage[] = [
  {
    code: 'BIRDIE-10/6',
    title: 'Аудит ландшафт',
    readiness: 100,
    updatedOn: '01.07',
    active: false,
    start: '18.03',
    meeting: '10.04',
    handover: '24.06',
    today: null,
    workItems: [
      { title: 'Ливневая канализация', pct: 100 },
      { title: 'Дренажная канализация', pct: 100 },
      { title: 'Фундаменты 2-х зданий', pct: 100 },
      { title: 'Гидро-геологические данные', pct: 100 },
      { title: 'Геодезические данные', pct: 100 },
      { title: 'Фундаменты дорожек и мощения', pct: 100 },
      { title: 'Фундаменты заборов', pct: 100 },
      { title: 'Основа существующего городка', pct: 100 },
      { title: 'Доп. кровля', pct: 100 },
      { title: 'Доп. полив', pct: 100 },
      { title: 'Доп. пожарный водопровод', pct: 100 },
      { title: 'Доп. отмостка', pct: 100 },
      { title: 'Доп. пожарный водопровод', pct: 100 },
      { title: 'Сбор интег. данных', pct: 100 },
    ],
    factEvents: [
      { month: 'Март 2026', date: '18.03', title: 'Согласование ТЗ и КП с Заказчиком' },
      { month: 'Март 2026', date: '25.03', title: 'Передача договора на подписание' },
      { month: 'Апрель 2026', date: '07.04', title: 'Согласование с Заказчиком и службами' },
      { month: 'Апрель 2026', date: '10.04', title: 'Подписание договора и оплата' },
      { month: 'Апрель 2026', date: '13.04', title: 'Запуск и развертка первой фазы работ' },
      { month: 'Апрель 2026', date: '30.04', title: 'Обсуждение результатов первой фазы работ' },
      { month: 'Май 2026', date: '16.05', title: 'Передача промежуточных результатов работ в УК и СБ' },
      { month: 'Июнь 2026', date: '24.06', title: 'Окончание работ по договору (50 р.д.)' },
    ],
    planEvents: [],
  },
  {
    code: 'BIRDIE-10/7',
    title: 'Уход деревья + дубы',
    readiness: 75,
    updatedOn: '01.07',
    active: true,
    start: '08.04',
    meeting: '17.04',
    handover: '30.09',
    today: '01.07',
    extraMarkers: ['01.08', '15.08'],
    workItems: [
      { title: 'Санитарная и формовочная обрезка — дубы', qty: '6 шт.', pct: 100 },
      { title: 'Аэрация, удобрения, инъекции — дубы', qty: '6 шт.', pct: 100 },
      { title: 'Резистография, топография', qty: '19 шт.', pct: 100 },
      { title: 'Колебание корневой плиты', pct: 0 },
      { title: 'Защита елей от вредителей', qty: '301 шт.', pct: 100 },
      { title: 'Защита сосен от вредителей', qty: '135 шт.', pct: 100 },
      { title: 'Санитарная и формовочная обрезка', qty: '551 шт.', pct: 100 },
      { title: 'Удаление деревьев', qty: '6 шт.', pct: 0 },
      { title: 'Корневая инъекция', qty: '450 шт.', pct: 100 },
      { title: 'Обработка и удобрение крон', qty: '531 шт.', pct: 60 },
    ],
    factEvents: [
      { month: 'Апрель 2026', date: '08.04', title: 'Согласование ТЗ с Заказчиком' },
      { month: 'Апрель 2026', date: '15.04', title: 'Согласование КП с Заказчиком' },
      { month: 'Апрель 2026', date: '17.04', title: 'Оперативный старт работ' },
      { month: 'Апрель 2026', date: '24.04', title: 'Передача договора на подписание' },
      { month: 'Май 2026', date: '14.05', title: 'Повторное согласование договора' },
      { month: 'Май 2026', date: '15.05', title: 'Передача счета на оплату' },
      { month: 'Май 2026', date: '18.05', title: 'Подписание договора и оплата' },
      { month: 'Июнь 2026', date: '10.06', title: 'Завершение первого этапа работ' },
    ],
    planEvents: [
      { month: 'Июль 2026', date: '01.07', title: 'Согласование удаления деревьев (Доп).' },
      { month: 'Август 2026', date: '01.08', title: 'Запуск и развертка второго этапа работ' },
      { month: 'Сентябрь 2026', date: '05.09', title: 'Предзащита финальных результатов' },
      { month: 'Сентябрь 2026', date: '30.09', title: 'Окончание работ по договору (122 р.д.)' },
    ],
  },
];

// BIRDIE-75 subprojects exist (per chat2: "Birdie-75/2 Пирогово: архитектурные
// решения", "Birdie-75/3: экстерьерные решения") but no dashboard content was
// ever authored for them in the design session — kept honest as empty/new
// stages rather than inventing numbers.
const BIRDIE_75_STAGES: ContractStage[] = [
  {
    code: 'BIRDIE-75/2',
    title: 'Пирогово: архитектурные решения',
    readiness: null,
    updatedOn: null,
    active: false,
    start: null,
    handover: null,
    today: null,
    workItems: [],
    factEvents: [],
    planEvents: [],
  },
  {
    code: 'BIRDIE-75/3',
    title: 'Пирогово: экстерьерные решения',
    readiness: null,
    updatedOn: null,
    active: false,
    start: null,
    handover: null,
    today: null,
    workItems: [],
    factEvents: [],
    planEvents: [],
  },
];

export const PROJECT_STAGES: Record<string, ContractStage[]> = {
  'BIRDIE-10': BIRDIE_10_STAGES,
  'BIRDIE-75': BIRDIE_75_STAGES,
};

export const recomputeReadiness = (workItems: WorkItem[]): number | null => {
  if (workItems.length === 0) return null;
  return Math.round(workItems.reduce((acc, w) => acc + w.pct, 0) / workItems.length);
};

export const makeNewStage = (): ContractStage => ({
  code: '',
  title: '',
  readiness: null,
  updatedOn: null,
  active: false,
  start: null,
  handover: null,
  today: null,
  workItems: [],
  factEvents: [],
  planEvents: [],
});
