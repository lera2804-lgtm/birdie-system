export interface ProjectInfo {
  code: string;
  title: string;
  address: string;
}

export const PROJECT_INFO: Record<string, ProjectInfo> = {
  'BIRDIE-10': {
    code: 'BIRDIE-10',
    title: 'Заречье · Кунцево-2, уч. 10',
    address: 'МО, Одинцовский р-н, р.п. Заречье, «Кунцево-2», уч. 10',
  },
  'BIRDIE-75': {
    code: 'BIRDIE-75',
    title: 'Мытищи · Клязьминское вдхр.',
    address: 'г. Мытищи, территория Туристический Пансионат Клязьминское водохранилище',
  },
};

export interface NavItem {
  id: 'dash' | 'reports' | 'docs' | 'settings';
  code: string;
  label: string;
  sub: string;
  roles: ('admin' | 'project_manager' | 'site_manager' | 'client')[];
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dash', code: '01', label: 'Дашборд', sub: 'сроки и готовность', roles: ['admin', 'project_manager', 'client'], path: 'dashboard' },
  { id: 'reports', code: '02', label: 'Отчёты', sub: 'календарь и фото', roles: ['admin', 'project_manager', 'site_manager', 'client'], path: 'reports' },
  { id: 'docs', code: '03', label: 'Архив документов', sub: 'все версии файлов', roles: ['admin', 'project_manager', 'client'], path: 'archive' },
  { id: 'settings', code: '04', label: 'Настройки', sub: 'пользователи и роли', roles: ['admin', 'project_manager'], path: 'settings' },
];
