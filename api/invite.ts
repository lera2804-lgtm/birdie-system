// Vercel Edge Function — the only place in this app allowed to use the
// Supabase service_role key. Creates (or reuses) an account for the invited
// email and grants it a role on the object. Never expose this key to the
// client bundle; it must only ever live in Vercel's server-side env vars.
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const ALLOWED_ROLES = ['project_manager', 'site_manager', 'client'];

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: 'Сервер не настроен: не хватает переменных окружения' }, 500);
  }

  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return json({ error: 'Не авторизовано' }, 401);

  let body: { objectCode?: string; role?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Некорректный запрос' }, 400);
  }
  const objectCode = body.objectCode?.trim();
  const role = body.role;
  const email = body.email?.trim().toLowerCase();
  if (!objectCode || !role || !email) return json({ error: 'Не хватает данных' }, 400);
  if (!ALLOWED_ROLES.includes(role)) return json({ error: 'Недопустимая роль' }, 400);

  // Caller's own session — used only to verify they're allowed to manage
  // this object, via the same RLS every other client call goes through.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Не авторизовано' }, 401);

  const { data: profile } = await callerClient.from('profiles').select('is_admin').eq('id', userData.user.id).single();
  let allowed = profile?.is_admin === true;
  if (!allowed) {
    const { data: membership } = await callerClient
      .from('memberships')
      .select('role')
      .eq('object_code', objectCode)
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .maybeSingle();
    allowed = membership?.role === 'project_manager';
  }
  if (!allowed) return json({ error: 'Недостаточно прав' }, 403);

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  let userId = existingProfile?.id;

  if (!userId) {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
    if (inviteError || !invited.user) {
      return json({ error: inviteError?.message ?? 'Не удалось пригласить пользователя' }, 500);
    }
    userId = invited.user.id;
  }

  const { error: membershipError } = await admin
    .from('memberships')
    .upsert({ object_code: objectCode, user_id: userId, role, status: 'active' }, { onConflict: 'object_code,user_id' });
  if (membershipError) return json({ error: membershipError.message }, 500);

  return json({ ok: true }, 200);
}
