import { MonoLabel } from '../primitives';
import { SysButton } from '../form';
import { SYS } from '../../theme/tokens';

export const ConfirmDeleteModal = ({
  title, message, onConfirm, onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div style={{ width: 420, maxWidth: '90%', background: SYS.paper, border: `1px solid ${SYS.ink}` }}>
      <div style={{ padding: '26px 28px 22px' }}>
        <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>подтверждение</MonoLabel>
        <h3 style={{ margin: '10px 0 8px', fontSize: 20, fontWeight: 500, letterSpacing: '-0.006em' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: SYS.ink2, lineHeight: 1.5 }}>{message}</p>
      </div>
      <div style={{ padding: '18px 28px 24px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
        <SysButton tone="ghost" full={false} small type="button" onClick={onCancel}>Отмена</SysButton>
        <button
          type="button"
          onClick={onConfirm}
          style={{ flex: 1, padding: '11px 0', background: SYS.red, color: '#fff', border: `1px solid ${SYS.red}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
);
