import { supabase } from './supabaseClient';
import type { Role } from '../theme/tokens';

export const inviteMember = async (objectCode: string, role: Role, email: string, name?: string): Promise<{ error: string | null }> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { error: 'Не авторизовано' };

  let res: Response;
  try {
    res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ objectCode, role, email, name }),
    });
  } catch {
    return { error: 'Не удалось связаться с сервером' };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: body.error ?? 'Не удалось отправить приглашение' };
  return { error: null };
};
