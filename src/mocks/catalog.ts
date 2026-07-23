import type { Role } from '../theme/tokens';

export interface CatalogProject {
  code: string;
  title: string;
  address: string;
  cover?: string;
}

export const CATALOG_PROJECTS: CatalogProject[] = [
  {
    code: 'BIRDIE-10',
    title: 'Birdie-10',
    address: 'МО, Одинцовский р-н, р.п. Заречье, «Кунцево-2», уч. 10',
    cover: '/assets/cover-birdie-10.jpeg',
  },
  {
    code: 'BIRDIE-75',
    title: 'Birdie-75',
    address: 'г. Мытищи, территория туристический Пансионат Клязьминское водохранилище',
    cover: '/assets/cover-birdie-75.jpeg',
  },
];

export const CATALOG_HEADING: Record<Role, string> = {
  admin: 'Все объекты в системе',
  project_manager: 'Ваши объекты',
  site_manager: 'Ваши объекты',
  client: 'Ваши объекты',
};

// Site (Object) Manager only ever works one object on the ground (BIRDIE-10);
// every other role sees the full portfolio. Per chat2: admin/pm/client see
// all 4 subprojects across both objects, site_manager only the two BIRDIE-10
// subprojects — grouped here at the object level (catalog groups by address,
// not by subproject, per the "убрать дубли" edit).
export const projectsForRole = (role: Role): CatalogProject[] =>
  role === 'site_manager' ? CATALOG_PROJECTS.slice(0, 1) : CATALOG_PROJECTS;
