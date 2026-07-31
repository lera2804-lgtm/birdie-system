import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Role } from '../theme/tokens';
import { useAuth } from '../auth/AuthContext';

interface ObjectRoleState {
  role: Role | null;
  loading: boolean;
}

// Role is a property of (user, object), not of the user alone — the same
// person can be PM on one object and Client on another. This resolves it
// once per object and hands it down via context so every page under
// ProjectShell reads the same value instead of re-querying.
export const useResolveObjectRole = (objectCode: string | undefined): ObjectRoleState => {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user || !objectCode) {
      setRole(null);
      setLoading(false);
      return;
    }
    if (user.isAdmin) {
      setRole('admin');
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('memberships')
      .select('role')
      .eq('object_code', objectCode)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setRole((data?.role as Role | undefined) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, objectCode]);

  return { role, loading };
};

const ObjectRoleContext = createContext<ObjectRoleState | null>(null);

export const ObjectRoleProvider = ({ value, children }: { value: ObjectRoleState; children: ReactNode }) => (
  <ObjectRoleContext.Provider value={value}>{children}</ObjectRoleContext.Provider>
);

export const useObjectRole = () => {
  const ctx = useContext(ObjectRoleContext);
  if (!ctx) throw new Error('useObjectRole must be used within ObjectRoleProvider');
  return ctx.role;
};
