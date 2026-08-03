import { useState } from 'react';
import { SysButton, SysLabeledField, SysModal, SysSelectField } from '../form';
import { MonoLabel } from '../primitives';
import { SYS, type Role } from '../../theme/tokens';
import { inviteMember } from '../../lib/invite';

export const InviteMemberModal = ({ objectCode, onClose, onInvited }: { objectCode: string; onClose: () => void; onInvited: () => void }) => {
  const [role, setRole] = useState<Role>('site_manager');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error: inviteError } = await inviteMember(objectCode, role, email.trim(), name.trim() || undefined);
    setSending(false);
    if (inviteError) {
      setError(inviteError);
      return;
    }
    setSent(true);
    onInvited();
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
          label="Роль" value={role} onChange={(e: any) => { setRole(e.target.value); setSent(false); }}
          options={[
            { value: 'project_manager', label: 'Project Manager' },
            { value: 'site_manager', label: 'Object Manager' },
            { value: 'client', label: 'Client' },
          ]}
        />
        <SysLabeledField
          label="Имя (опционально)"
          placeholder="напр. Иван Иванов"
          value={name}
          onChange={(e: any) => { setName(e.target.value); setSent(false); }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <SysLabeledField label="Email" placeholder="name@example.com" value={email} error={!!error} onChange={(e: any) => { setEmail(e.target.value); setSent(false); setError(null); }} />
          </div>
          <SysButton tone="fill" full={false} small type="button" disabled={!email.trim()} loading={sending} onClick={send}>
            {sent ? 'Отправлено ✓' : 'Отправить'}
          </SysButton>
        </div>
        {error && (
          <div style={{ fontSize: 11.5, color: SYS.red, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠</span> {error}
          </div>
        )}
        <p style={{ margin: 0, fontSize: 11.5, color: SYS.muted, lineHeight: 1.5 }}>
          На указанный email придёт письмо со ссылкой для входа. Роль и объект заданы здесь — изменить их самостоятельно приглашённый не сможет.
        </p>
      </div>

      <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Закрыть</SysButton>
      </div>
    </SysModal>
  );
};
