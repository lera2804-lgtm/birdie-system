import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '../theme/tokens';

export interface MockUser {
  email: string;
  password: string;
  role: Role;
  name: string;
}

// No backend yet — these are the same demo identities the design mocks
// reference by email (login screen defaultValue, invite screen, catalog
// display names). Password is the same for all so the "wrong password"
// error state can be demoed by typing anything else.
export const MOCK_USERS: MockUser[] = [
  { email: 'orlov@orlov.red', password: 'demo1234', role: 'admin', name: 'Орлов А.' },
  { email: 'a.chernyshev@orlov.red', password: 'demo1234', role: 'project_manager', name: 'Чернышёв А.' },
  { email: 'brigada2@orlov.red', password: 'demo1234', role: 'site_manager', name: 'Иванов И.' },
  { email: 'invest@example.com', password: 'demo1234', role: 'client', name: 'Иванов А.К.' },
];

interface AuthState {
  user: MockUser | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginAs: (role: Role) => void;
  acceptInvite: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'birdie.auth.user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 500));
        const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) {
          return { ok: false, error: 'Неверный email или пароль. Проверьте раскладку и Caps Lock.' };
        }
        setUser(found);
        return { ok: true };
      },
      loginAs: (role) => {
        const found = MOCK_USERS.find((u) => u.role === role);
        if (found) setUser(found);
      },
      acceptInvite: (name, email, _password) => {
        setUser({ email: email || 'invest@example.com', password: _password, role: 'client', name: name || 'Иванов А.К.' });
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
