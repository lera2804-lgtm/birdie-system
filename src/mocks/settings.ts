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
