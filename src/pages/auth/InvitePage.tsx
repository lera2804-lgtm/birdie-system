import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthShell, SysButton, SysField } from '../../components/form';
import { MonoLabel } from '../../components/primitives';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';

export const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('invest@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const expired = token === 'expired' || token === 'used';
  const canSubmit = name.trim() && email.trim() && password.length >= 6;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    const res = await signUp(name, email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate('/', { replace: true });
  };

  if (expired) {
    return (
      <AuthShell kicker="приглашение в проект">
        <div style={{ maxWidth: 360 }}>
          <div
            style={{
              width: 46, height: 46, border: `1px solid ${SYS.red}`, color: SYS.red,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20,
            }}
          >
            ⚠
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>Ссылка недействительна</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: SYS.ink2, lineHeight: 1.55 }}>
            Приглашение истекло (срок 7 дней) или уже было использовано.
            Попросите менеджера проекта прислать новую ссылку-приглашение.
          </p>
          <SysButton tone="ghost" full={false} small type="button" onClick={() => (window.location.href = 'mailto:pm@orlov.red')}>
            Написать менеджеру ↗
          </SysButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell kicker="приглашение в проект">
      <form onSubmit={onSubmit} style={{ maxWidth: 340 }}>
        <MonoLabel color={SYS.red}>шаг 1 из 1</MonoLabel>
        <h2 style={{ margin: '10px 0 4px', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>Вас пригласили</h2>
        <div style={{ margin: '0 0 22px', fontSize: 14, color: SYS.ink2, lineHeight: 1.5 }}>
          в проект <strong>BIRDIE-10</strong> · Аудит ландшафта
        </div>

        <div style={{ marginBottom: 22 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px',
              border: `1px solid ${SYS.line}`, fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: SYS.ink,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8a8680', flex: 'none' }} />
            Client
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SysField icon="◇" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
          <SysField icon="✉" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <SysField icon="⚿" placeholder="Придумайте пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>

        {error && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, color: SYS.red, fontSize: 12.5 }}>
            <span>⚠</span> {error}
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <SysButton type="submit" disabled={!canSubmit} loading={loading}>{loading ? 'Создаём доступ…' : 'Создать доступ и войти'}</SysButton>
        </div>

        <p style={{ marginTop: 16, fontSize: 11, color: SYS.muted, lineHeight: 1.5 }}>
          Ссылка-приглашение одноразовая и действует 7 дней. Роль и объект — заданы
          менеджером проекта, изменить их самостоятельно нельзя.
        </p>
      </form>
    </AuthShell>
  );
};
