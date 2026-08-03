// Brand + system design tokens — ported 1:1 from the Claude Design bundle
// (project/directions/sys-shared.jsx `SYS`). Keep in sync if the design
// system changes; these values are referenced across every screen.

export const SYS = {
  bg: '#e3e0d5',
  paper: '#ffffff',
  ink: '#0a0a0a',
  ink2: '#3a3a3a',
  muted: '#8a8680',
  line: '#c9c4b6',
  red: '#e63818',
} as const;

export const FONT_SANS = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";

export type Role = 'admin' | 'project_manager' | 'site_manager' | 'client';

export const ROLE_META: Record<Role, { label: string; desc: string; color: string }> = {
  admin: { label: 'Admin', desc: 'Полный доступ к системе', color: '#e63818' },
  project_manager: { label: 'Project Manager', desc: 'ИТР · управление объектом', color: '#0a0a0a' },
  site_manager: { label: 'Object Manager', desc: 'Менеджер объекта · площадка', color: '#0a0a0a' },
  client: { label: 'Client', desc: 'Заказчик · только просмотр', color: '#8a8680' },
};
