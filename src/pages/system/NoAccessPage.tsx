import { useNavigate } from 'react-router-dom';
import { SysButton } from '../../components/form';
import { MonoLabel, OrlovMark, RoleBadge } from '../../components/primitives';
import { ROLE_META, SYS, type Role } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';

const SysBareTop = ({ role }: { role: Role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', borderBottom: `1px solid ${SYS.line}`, background: SYS.paper }}>
      <OrlovMark size={12} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <RoleBadge role={role} size="sm" />
        <a href="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }} style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none' }}>выход ↗</a>
      </div>
    </div>
  );
};

export const NoAccessPage = ({ role }: { role: Role }) => {
  const navigate = useNavigate();
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: SYS.bg, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      <SysBareTop role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 40px' }}>
        <div style={{ width: 60, height: 60, border: `1px solid ${SYS.red}`, color: SYS.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 22 }}>⚿</div>
        <MonoLabel color={SYS.red}>доступ ограничен</MonoLabel>
        <h1 style={{ margin: '14px 0 0', fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em' }}>Раздел недоступен для вашей роли</h1>
        <p style={{ margin: '14px 0 28px', fontSize: 14.5, color: SYS.ink2, lineHeight: 1.55, maxWidth: 460 }}>
          Роль <strong>{ROLE_META[role].label}</strong> не открывает эту страницу. Например, архив и дашборд закрыты для Object Manager, а настройки — только для менеджеров.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <SysButton tone="fill" full={false} small type="button" onClick={() => navigate(-1)}>← Вернуться назад</SysButton>
          <SysButton tone="ghost" full={false} small type="button" onClick={() => (window.location.href = 'mailto:pm@orlov.red')}>Запросить доступ у ПМ</SysButton>
        </div>
      </div>
    </div>
  );
};
