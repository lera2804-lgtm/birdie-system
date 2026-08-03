// Vercel Node Function — the only place in this app allowed to use the
// Supabase service_role key. Creates (or reuses) an account for the invited
// email and grants it a role on the object. Never expose this key to the
// client bundle; it must only ever live in Vercel's server-side env vars.
//
// Written against plain Node http types (no @vercel/node dependency, no
// Edge runtime) and reads the request body manually rather than relying on
// any framework's auto-parsing, to keep this as few moving parts as possible.
import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_ROLES = ['project_manager', 'site_manager', 'client'];

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const readBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return send(res, 500, { error: 'Сервер не настроен: не хватает переменных окружения' });
  }

  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (!token) return send(res, 401, { error: 'Не авторизовано' });

  let body: { objectCode?: string; role?: string; email?: string; name?: string };
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: 'Некорректный запрос' });
  }
  const objectCode = body.objectCode?.trim();
  const role = body.role;
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  if (!objectCode || !role || !email) return send(res, 400, { error: 'Не хватает данных' });
  if (!ALLOWED_ROLES.includes(role)) return send(res, 400, { error: 'Недопустимая роль' });

  // Caller's own session — used only to verify they're allowed to manage
  // this object, via the same RLS every other client call goes through.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return send(res, 401, { error: 'Не авторизовано' });

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
  if (!allowed) return send(res, 403, { error: 'Недостаточно прав' });

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  let userId = existingProfile?.id;

  if (!userId) {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: name ? { name } : undefined,
    });
    if (inviteError || !invited.user) {
      return send(res, 500, { error: inviteError?.message || 'Не удалось пригласить пользователя' });
    }
    userId = invited.user.id;
  }

  const { error: membershipError } = await admin
    .from('memberships')
    .upsert({ object_code: objectCode, user_id: userId, role, status: 'active' }, { onConflict: 'object_code,user_id' });
  if (membershipError) return send(res, 500, { error: membershipError.message });

  return send(res, 200, { ok: true });
}
