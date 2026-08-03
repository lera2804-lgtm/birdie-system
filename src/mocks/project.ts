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
