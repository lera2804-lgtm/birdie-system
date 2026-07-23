import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthShell, SysButton, SysField } from '../../components/form';
import { MonoLabel, OrlovMark } from '../../components/primitives';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useIsMobile } from '../../hooks/useIsMobile';

const DEMO_HINT = 'Демо-пароль для всех аккаунтов: demo1234 (admin: orlov@orlov.red · PM: a.chernyshev@orlov.red · Object Manager: brigada2@orlov.red · Client: invest@example.com)';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    navigate(from || '/', { replace: true });
  };

  const fields = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SysField
        icon="✉"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        error={!!error}
      />
      <SysField
        icon="⚿"
        placeholder="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        error={!!error}
      />
    </div>
  );

  const errorRow = error && (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, color: SYS.red, fontSize: 12.5 }}>
      <span>⚠</span> {error}
    </div>
  );

  const links = (
    <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
      <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}>
        Забыли пароль?
      </a>
      <a href="mailto:support@orlov.red" style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}>
        Нужна помощь ↗
      </a>
    </div>
  );

  const hint = (
    <div style={{ marginTop: 20, fontSize: 10.5, color: SYS.muted, lineHeight: 1.5, borderTop: `1px solid ${SYS.line}`, paddingTop: 14 }}>
      {DEMO_HINT}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: SYS.paper, color: SYS.ink, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: 220,
            flex: 'none',
            position: 'relative',
            background: 'repeating-linear-gradient(135deg, #1a1a1a 0 8px, #141414 8px 16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 24,
          }}
        >
          <OrlovMark inverse size={11} />
          <MonoLabel color="#e88a76">строительный мониторинг</MonoLabel>
        </div>

        <form onSubmit={onSubmit} style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>Личный кабинет</h2>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: SYS.muted, lineHeight: 1.5 }}>
            Отчёты с площадки — прямо с телефона, без WhatsApp.
          </p>

          {fields}
          {errorRow}

          <div style={{ marginTop: 20 }}>
            <SysButton type="submit" disabled={!canSubmit} loading={loading}>{loading ? 'Вход…' : 'Войти'}</SysButton>
          </div>

          <a
            href="/forgot-password"
            onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
            style={{ marginTop: 16, fontSize: 12, color: SYS.muted, textDecoration: 'none', textAlign: 'center' }}
          >
            Забыли пароль?
          </a>

          {hint}

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${SYS.line}`, textAlign: 'center' }}>
            <MonoLabel color={SYS.muted} style={{ fontSize: 9 }}>orlov · red</MonoLabel>
          </div>
        </form>
      </div>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} style={{ maxWidth: 340 }}>
        <MonoLabel color={SYS.red}>вход в систему</MonoLabel>
        <h2 style={{ margin: '10px 0 6px', fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em' }}>Личный кабинет</h2>
        <p style={{ margin: '0 0 32px', fontSize: 14, color: SYS.muted, lineHeight: 1.5 }}>
          Доступ и раздел кабинета определяются вашей ролью в проекте.
        </p>

        {fields}
        {errorRow}
        {!error && !canSubmit && (
          <div style={{ marginTop: 10, fontSize: 11.5, color: SYS.muted }}>Заполните email и пароль, чтобы продолжить.</div>
        )}

        <div style={{ marginTop: 22 }}>
          <SysButton type="submit" disabled={!canSubmit} loading={loading}>{loading ? 'Вход…' : 'Войти'}</SysButton>
        </div>

        {links}
        {hint}
      </form>
    </AuthShell>
  );
};
