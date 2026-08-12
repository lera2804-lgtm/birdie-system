import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import { FONT_MONO, FONT_SANS, SYS } from '../theme/tokens';
import { MonoLabel, OrlovMark } from './primitives';

export const SysField = ({
  icon,
  placeholder,
  type = 'text',
  error,
  style,
  ...rest
}: {
  icon: ReactNode;
  placeholder: string;
  type?: string;
  error?: boolean;
  style?: CSSProperties;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'placeholder'>) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: `1px solid ${error ? SYS.red : SYS.line}`,
      background: SYS.paper,
      padding: '15px 16px',
      ...style,
    }}
  >
    <span style={{ color: error ? SYS.red : SYS.muted, fontSize: 15, width: 16, textAlign: 'center', flex: 'none' }}>{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      style={{
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontFamily: FONT_SANS,
        fontSize: 15,
        color: SYS.ink,
        minWidth: 0,
      }}
      {...rest}
    />
  </div>
);

export const SysButton = ({
  children,
  tone = 'fill',
  full = true,
  small,
  disabled,
  loading,
  style,
  ...rest
}: {
  children: ReactNode;
  tone?: 'fill' | 'ghost';
  full?: boolean;
  small?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: CSSProperties;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const palette = tone === 'fill' ? { bg: SYS.ink, fg: '#fff', bd: SYS.ink } : { bg: 'transparent', fg: SYS.ink, bd: SYS.line };
  const off = disabled || loading;
  return (
    <button
      disabled={off}
      style={{
        width: full ? '100%' : undefined,
        padding: small ? '11px 18px' : '16px 0',
        background: off ? '#c9c4b6' : palette.bg,
        color: off ? '#f5f4f0' : palette.fg,
        border: `1px solid ${off ? '#c9c4b6' : palette.bd}`,
        fontFamily: FONT_MONO,
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: off ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        ...style,
      }}
      {...rest}
    >
      {loading && (
        <span
          style={{
            width: 12,
            height: 12,
            border: '2px solid rgba(245,244,240,0.4)',
            borderTopColor: '#f5f4f0',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'sys-spin 0.7s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};

export const SysLabeledField = ({
  label,
  placeholder,
  hint,
  as,
  style,
  error,
  ...rest
}: {
  label: string;
  placeholder?: string;
  hint?: string;
  as?: 'textarea';
  style?: CSSProperties;
  error?: boolean;
} & Record<string, any>) => (
  <div style={style}>
    <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{label}</MonoLabel>
    {as === 'textarea' ? (
      <textarea
        placeholder={placeholder}
        rows={2}
        style={{
          marginTop: 8,
          width: '100%',
          resize: 'none',
          border: `1px solid ${error ? SYS.red : SYS.line}`,
          background: SYS.paper,
          padding: '12px 14px',
          fontFamily: FONT_SANS,
          fontSize: 14,
          color: SYS.ink,
          outline: 'none',
        }}
        {...rest}
      />
    ) : (
      <input
        placeholder={placeholder}
        style={{
          marginTop: 8,
          width: '100%',
          border: `1px solid ${error ? SYS.red : SYS.line}`,
          background: SYS.paper,
          padding: '13px 14px',
          fontFamily: FONT_SANS,
          fontSize: 14,
          color: SYS.ink,
          outline: 'none',
          boxSizing: 'border-box',
        }}
        {...rest}
      />
    )}
    {hint && <div style={{ marginTop: 6, fontSize: 11.5, color: SYS.muted, lineHeight: 1.4 }}>{hint}</div>}
  </div>
);

export const SysSelectField = ({
  label,
  hint,
  options,
  style,
  ...rest
}: {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  style?: CSSProperties;
} & Record<string, any>) => (
  <div style={style}>
    <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{label}</MonoLabel>
    <div style={{ position: 'relative', marginTop: 8 }}>
      <select
        style={{
          width: '100%',
          appearance: 'none',
          border: `1px solid ${SYS.line}`,
          background: SYS.paper,
          padding: '13px 34px 13px 14px',
          fontFamily: FONT_SANS,
          fontSize: 14,
          color: SYS.ink,
          outline: 'none',
          cursor: 'pointer',
        }}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: SYS.muted, fontSize: 11, pointerEvents: 'none' }}>▾</span>
    </div>
    {hint && <div style={{ marginTop: 6, fontSize: 11.5, color: SYS.muted, lineHeight: 1.4 }}>{hint}</div>}
  </div>
);

export const SysModal = ({ children, width = 640, onClose }: { children: ReactNode; width?: number; onClose?: () => void }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10,10,10,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 24,
    }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
  >
    <div
      className="sys-modal-scroll"
      style={{
        width,
        maxWidth: '100%',
        maxHeight: '86vh',
        overflow: 'auto',
        background: SYS.paper,
        border: `1px solid ${SYS.ink}`,
      }}
    >
      {children}
    </div>
  </div>
);

export const AuthShell = ({
  children,
  kicker,
}: {
  children: ReactNode;
  kicker?: string;
}) => (
  <div
    style={{
      minHeight: '100vh',
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 480px',
      background: SYS.paper,
      color: SYS.ink,
      fontFamily: FONT_SANS,
    }}
  >
    <div
      style={{
        position: 'relative',
        background: 'repeating-linear-gradient(135deg, #1a1a1a 0 8px, #141414 8px 16px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 56,
      }}
    >
      <OrlovMark inverse size={9} />
      <div style={{ maxWidth: 480 }}>
        <MonoLabel color="#e88a76">{kicker || 'строительный мониторинг'}</MonoLabel>
        <h1
          style={{
            margin: '14px 0 0',
            color: '#f5f4f0',
            fontWeight: 500,
            fontSize: 38,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          Ход строительства в одной точке
        </h1>
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'rgba(245,244,240,0.4)',
          textTransform: 'uppercase',
        }}
      >
        orlov · red
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 56px' }}>{children}</div>
  </div>
);
