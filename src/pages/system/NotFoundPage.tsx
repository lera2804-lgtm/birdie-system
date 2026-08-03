import { useNavigate } from 'react-router-dom';
import { SysButton } from '../../components/form';
import { MonoLabel, OrlovMark, RoleBadge } from '../../components/primitives';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';

const SysBareTop = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', borderBottom: `1px solid ${SYS.line}`, background: SYS.paper }}>
      <OrlovMark size={12} />
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user.isAdmin && <RoleBadge role="admin" size="sm" />}
          <a href="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }} style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}>выход ↗</a>
        </div>
      ) : (
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}>войти ↗</a>
      )}
    </div>
  );
};

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: SYS.bg, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      <SysBareTop />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 40px' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 96, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>404</div>
        <MonoLabel color={SYS.red} style={{ marginTop: 16 }}>страница не найдена</MonoLabel>
        <p style={{ margin: '16px 0 28px', fontSize: 15, color: SYS.ink2, lineHeight: 1.55, maxWidth: 440 }}>
          Такой страницы нет или её адрес изменился. Проверьте ссылку или вернитесь к списку объектов.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <SysButton tone="fill" full={false} small type="button" onClick={() => navigate('/')}>← К каталогу объектов</SysButton>
          <SysButton tone="ghost" full={false} small type="button" onClick={() => (window.location.href = 'mailto:support@orlov.red')}>Написать в поддержку ↗</SysButton>
        </div>
      </div>
    </div>
  );
};
