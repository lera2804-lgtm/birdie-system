import type { CSSProperties, ReactNode } from 'react';
import { FONT_MONO, FONT_SANS, ROLE_META, SYS, type Role } from '../theme/tokens';

export const OrlovMark = ({ inverse, size = 14 }: { inverse?: boolean; size?: number }) => {
  const ink = inverse ? '#f5f4f0' : '#0a0a0a';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.55,
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.32em',
        color: ink,
      }}
    >
      <span>ORLOV</span>
      <span
        style={{
          display: 'inline-block',
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: '50%',
          background: '#e63818',
        }}
      />
      <span style={{ color: '#e63818' }}>RED</span>
    </div>
  );
};

export const MonoLabel = ({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) => (
  <span
    style={{
      fontFamily: FONT_MONO,
      fontSize: 11,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: color || 'inherit',
      ...style,
    }}
  >
    {children}
  </span>
);

export const Pill = ({
  children,
  color = SYS.red,
  tone = 'fill',
}: {
  children: ReactNode;
  color?: string;
  tone?: 'fill' | 'ghost' | 'soft';
}) => {
  const palette = {
    fill: { bg: color, fg: '#fff', bd: color },
    ghost: { bg: 'transparent', fg: color, bd: color },
    soft: { bg: 'rgba(230,56,24,0.1)', fg: color, bd: 'transparent' },
  }[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.bd}`,
        fontFamily: FONT_MONO,
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
};

export const RedDot = ({ size = 8, style = {} }: { size?: number; style?: CSSProperties }) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: SYS.red,
      ...style,
    }}
  />
);

export const RoleBadge = ({ role, size = 'md' }: { role: Role; size?: 'sm' | 'md' }) => {
  const m = ROLE_META[role];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: size === 'sm' ? '4px 9px' : '6px 12px',
        border: `1px solid ${SYS.line}`,
        fontFamily: FONT_MONO,
        fontSize: size === 'sm' ? 10 : 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: SYS.ink,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flex: 'none' }} />
      {m.label}
    </span>
  );
};

export const PhotoPlaceholder = ({
  label = 'PHOTO',
  caption,
  tint = 'light',
  height = 220,
  ratio,
  style = {},
  cornerLabel,
  badge,
}: {
  label?: string;
  caption?: string;
  tint?: 'light' | 'dark';
  height?: number;
  ratio?: string;
  style?: CSSProperties;
  cornerLabel?: string;
  badge?: ReactNode;
}) => {
  const dark = tint === 'dark';
  const stripeA = dark ? '#171717' : '#e7e3d8';
  const stripeB = dark ? '#1d1d1d' : '#ddd8ca';
  const fg = dark ? 'rgba(245,244,240,0.55)' : 'rgba(10,10,10,0.45)';
  const bg = `repeating-linear-gradient(135deg, ${stripeA} 0 8px, ${stripeB} 8px 16px)`;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: ratio ? undefined : height,
        aspectRatio: ratio,
        background: bg,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: dark
            ? 'radial-gradient(60% 80% at 50% 40%, rgba(255,255,255,0.06), transparent 70%)'
            : 'radial-gradient(60% 80% at 50% 40%, rgba(255,255,255,0.35), transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 4,
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: fg,
          textAlign: 'center',
          padding: 16,
        }}
      >
        <span>{label}</span>
        {caption && <span style={{ opacity: 0.7, letterSpacing: '0.1em', textTransform: 'none' }}>{caption}</span>}
      </div>
      {cornerLabel && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            bottom: 10,
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: dark ? '#f5f4f0' : '#0a0a0a',
            background: dark ? 'rgba(10,10,10,0.55)' : 'rgba(245,244,240,0.85)',
            padding: '4px 8px',
          }}
        >
          {cornerLabel}
        </div>
      )}
      {badge && (
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: SYS.red,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.1em',
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
};
