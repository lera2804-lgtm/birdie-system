import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const loadProfile = async (id: string, fallbackEmail: string): Promise<AuthUser> => {
  const { data } = await supabase.from('profiles').select('name, email, is_admin').eq('id', id).maybeSingle();
  return {
    id,
    email: data?.email ?? fallbackEmail,
    name: data?.name || fallbackEmail,
    isAdmin: data?.is_admin ?? false,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        if (!cancelled) setLoading(false);
        return;
      }
      const profile = await loadProfile(session.user.id, session.user.email ?? '');
      if (!cancelled) {
        setUser(profile);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        return;
      }
      const profile = await loadProfile(session.user.id, session.user.email ?? '');
      setUser(profile);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          return { ok: false, error: 'Неверный email или пароль. Проверьте раскладку и Caps Lock.' };
        }
        return { ok: true };
      },
      signUp: async (name, email, password) => {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        return { ok: true };
      },
      logout: async () => {
        await supabase.auth.signOut();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
