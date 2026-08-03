import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export interface CatalogObjectRow {
  code: string;
  title: string;
  address: string;
  cover_url: string | null;
}

// Admin sees every non-archived object; everyone else sees only the
// objects they have an active membership on.
export const useMyObjects = () => {
  const { user } = useAuth();
  const [objects, setObjects] = useState<CatalogObjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return [];
    if (user.isAdmin) {
      const { data } = await supabase
        .from('objects')
        .select('code, title, address, cover_url')
        .eq('archived', false)
        .order('created_at');
      return data ?? [];
    }
    const { data } = await supabase
      .from('memberships')
      .select('objects(code, title, address, cover_url, archived)')
      .eq('user_id', user.id)
      .eq('status', 'active');
    return (data ?? [])
      .map((row) => row.objects as unknown as (CatalogObjectRow & { archived: boolean }) | null)
      .filter((o): o is CatalogObjectRow & { archived: boolean } => !!o && !o.archived);
  }, [user]);

  const refetch = useCallback(() => {
    setLoading(true);
    load().then((rows) => {
      setObjects(rows);
      setLoading(false);
    });
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setObjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    load().then((rows) => {
      if (cancelled) return;
      setObjects(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, load]);

  return { objects, loading, refetch };
};
