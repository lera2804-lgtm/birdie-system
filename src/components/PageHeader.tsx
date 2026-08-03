import type { ReactNode } from 'react';
import { MonoLabel } from './primitives';
import { SYS } from '../theme/tokens';

// Single header shape reused across every object-scoped page (dashboard,
// reports, report day, archive, settings) — kicker label, title, optional
// meta line, all at the same size so pages read as one system.
export const PageHeader = ({
  kicker, title, meta, right,
}: {
  kicker: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${SYS.line}`, gap: 24, flexWrap: 'wrap' }}>
    <div>
      <MonoLabel color={SYS.red}>{kicker}</MonoLabel>
      <h1 style={{ margin: '10px 0 0', fontSize: 36, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</h1>
      {meta && <div style={{ marginTop: 8, fontSize: 13, color: SYS.muted, lineHeight: 1.5, maxWidth: 640 }}>{meta}</div>}
    </div>
    {right && <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>{right}</div>}
  </div>
);
