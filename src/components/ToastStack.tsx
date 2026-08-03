import { SYS } from '../theme/tokens';
import { useToasts, type ToastKind } from '../state/ToastContext';

const ACCENT: Record<ToastKind, string> = { error: SYS.red, success: SYS.ink, info: SYS.muted };
const ICON: Record<ToastKind, string> = { error: '⚠', success: '✓', info: 'ℹ' };

export const ToastStack = () => {
  const { toasts, removeToast } = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', right: 32, bottom: 32, display: 'flex', flexDirection: 'column', gap: 12, zIndex: 500 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, width: 340,
            background: SYS.paper, border: `1px solid ${SYS.line}`, borderLeft: `3px solid ${ACCENT[t.kind]}`,
            padding: '14px 16px', boxShadow: '0 8px 24px rgba(10,10,10,0.12)',
          }}
        >
          <span style={{ color: ACCENT[t.kind], fontSize: 14, lineHeight: 1.4 }}>{ICON[t.kind]}</span>
          <div style={{ flex: 1, fontSize: 13, color: SYS.ink, lineHeight: 1.4 }}>{t.text}</div>
          <span onClick={() => removeToast(t.id)} style={{ color: SYS.muted, fontSize: 13, cursor: 'pointer' }}>✕</span>
        </div>
      ))}
    </div>
  );
};
