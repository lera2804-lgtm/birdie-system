import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthShell, SysButton, SysField } from '../../components/form';
import { SYS } from '../../theme/tokens';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const canSubmit = email.trim().length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    navigate(`/reset-sent?email=${encodeURIComponent(email)}`);
  };

  return (
    <AuthShell kicker="восстановление доступа">
      <form onSubmit={onSubmit} style={{ maxWidth: 340 }}>
        <a
          href="/login"
          onClick={(e) => { e.preventDefault(); navigate('/login'); }}
          style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}
        >
          ← ко входу
        </a>
        <h2 style={{ margin: '14px 0 6px', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>Забыли пароль?</h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: SYS.muted, lineHeight: 1.5 }}>
          Укажите email — пришлём ссылку для создания нового пароля.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SysField icon="✉" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div style={{ marginTop: 22 }}>
          <SysButton type="submit" disabled={!canSubmit}>Прислать ссылку</SysButton>
        </div>
      </form>
    </AuthShell>
  );
};
