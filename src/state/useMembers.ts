import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Member } from '../mocks/settings';

interface MembershipRow {
  id: string;
  role: Member['role'];
  status: Member['status'];
  invited_email: string | null;
  profiles: { name: string; email: string } | null;
}

export const useMembers = (objectCode: string) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('memberships')
      .select('id, role, status, invited_email, profiles(name, email)')
      .eq('object_code', objectCode);
    setMembers(
      ((data ?? []) as unknown as MembershipRow[]).map((r) => ({
        id: r.id,
        role: r.role,
        status: r.status,
        name: r.profiles?.name || '—',
        email: r.profiles?.email ?? r.invited_email ?? '—',
      })),
    );
    setLoading(false);
  }, [objectCode]);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (membershipId: string) => {
    const { error } = await supabase.from('memberships').delete().eq('id', membershipId);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  };

  return { members, loading, revoke, refetch: load };
};
