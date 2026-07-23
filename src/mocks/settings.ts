import type { Role } from '../theme/tokens';

export interface ProjectDetails {
  name: string;
  startDate: string; // YYYY-MM-DD
  address: string;
  village: string;
  cadastre: string;
  contacts: string;
  cover: string;
}

export interface Member {
  id: string;
  role: Role;
  name: string;
  email: string;
  status: 'active' | 'pending';
}

const PROJECT_DETAILS: Record<string, ProjectDetails> = {
  'BIRDIE-10': {
    name: 'Birdie-10',
    startDate: '2026-03-18',
    address: 'МО, Одинцовский р-н, р.п. Заречье, «Кунцево-2», уч. 10',
    village: '«Кунцево-2»',
    cadastre: '50:20:0020208:7320, 9102, 9103',
    contacts: '8 495 517 37 37 · info@orlov.red',
    cover: '/assets/cover-birdie-10.jpeg',
  },
  'BIRDIE-75': {
    name: 'Birdie-75',
    startDate: '2026-04-01',
    address: 'г. Мытищи, территория Туристический Пансионат Клязьминское водохранилище',
    village: '',
    cadastre: '',
    contacts: '',
    cover: '/assets/cover-birdie-75.jpeg',
  },
};

const MEMBERS_SEED: Member[] = [
  { id: 'u1', role: 'project_manager', name: 'Чернышёв А.', email: 'a.chernyshev@orlov.red', status: 'active' },
  { id: 'u2', role: 'site_manager', name: 'Иванов И.', email: 'i.ivanov@orlov.red', status: 'active' },
  { id: 'u3', role: 'client', name: 'Комаров В.', email: 'komarov@example.com', status: 'active' },
  { id: 'u4', role: 'client', name: '—', email: 'invest@example.com', status: 'pending' },
];

export const seedProjectDetails = (projectCode: string): ProjectDetails => ({ ...PROJECT_DETAILS[projectCode] });
export const seedMembers = (): Member[] => MEMBERS_SEED.map((m) => ({ ...m }));
