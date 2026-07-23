import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS, type Role } from '../../theme/tokens';
import type { Member } from '../../mocks/settings';
import { useToasts } from '../../state/ToastContext';

export const InviteMemberModal = ({ onClose, onInvite }: { onClose: () => void; onInvite: (member: Member) => void }) => {
  const { addToast } = useToasts();
  const [role, setRole] = useState<Role>('site_manager');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!email.trim()) return;
    onInvite({ id: `u${Date.now()}`, role, name: '—', email: email.trim(), status: 'pending' });
    setSent(true);
    addToast('info', `Приглашение отправлено на ${email.trim()}.`);
  };

  return (
    <SysModal width={520} onClose={onClose}>
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <MonoLabel color={SYS.red}>настройки · доступ</MonoLabel>
          <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>Пригласить участника</h2>
        </div>
        <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
      </div>

      <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <SysSelectField
          label="Роль" value={role} onChange={(e: any) => setRole(e.target.value)}
          options={[
            { value: 'project_manager', label: 'Project Manager' },
            { value: 'site_manager', label: 'Object Manager' },
            { value: 'client', label: 'Client' },
          ]}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <SysLabeledField label="Email" placeholder="name@example.com" value={email} onChange={(e: any) => { setEmail(e.target.value); setSent(false); }} />
          </div>
          <SysButton tone="fill" full={false} small type="button" disabled={!email.trim()} onClick={send}>
            {sent ? 'Отправлено ✓' : 'Отправить'}
          </SysButton>
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: SYS.muted, lineHeight: 1.5 }}>
          На указанный email придёт одноразовая ссылка-приглашение (действует 7 дней). Роль и объект заданы здесь — изменить их самостоятельно приглашённый не сможет.
        </p>
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Закрыть</SysButton>
      </div>
    </SysModal>
  );
};
