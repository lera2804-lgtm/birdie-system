import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell, SysButton } from '../../components/form';
import { SYS } from '../../theme/tokens';

export const ResetSentPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || 'вашу почту';
  const [resent, setResent] = useState(false);

  return (
    <AuthShell kicker="восстановление доступа">
      <div style={{ maxWidth: 360 }}>
        <div style={{ width: 46, height: 46, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 20 }}>✉</div>
        <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>Проверьте почту</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: SYS.ink2, lineHeight: 1.55 }}>
          Отправили ссылку для сброса пароля на <strong>{email}</strong>.
          Она действует 1 час. Не пришло письмо — проверьте «Спам».
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SysButton tone="ghost" full={false} small type="button" onClick={() => navigate('/login')}>← Ко входу</SysButton>
          <SysButton tone="ghost" full={false} small type="button" onClick={() => setResent(true)}>
            {resent ? 'Отправлено ✓' : 'Отправить ещё раз'}
          </SysButton>
        </div>
      </div>
    </AuthShell>
  );
};
