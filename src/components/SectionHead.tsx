import type { ReactNode } from 'react';
import { MonoLabel } from './primitives';
import { SYS } from '../theme/tokens';

// Shared second-level header for cards/sections within a page (as opposed
// to PageHeader, which is the top-level page title). Used by Archive,
// Settings, and the report-day project sections so they share one size.
export const SectionHead = ({
  kicker, title, count, sub, action,
}: {
  kicker?: string;
  title: string;
  count?: string;
  sub?: string;
  action?: ReactNode;
}) => (
  <div style={{ padding: '20px 24px', borderBottom: `1px solid ${SYS.line}`, background: SYS.bg, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
    <div>
      {kicker && <MonoLabel color={SYS.red} style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>{kicker}</MonoLabel>}
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: '-0.006em' }}>{title}</h2>
      {count && <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SYS.ink2 }}>{count}</div>}
      {sub && <div style={{ marginTop: 5, fontSize: 12.5, color: SYS.muted }}>{sub}</div>}
    </div>
    {action}
  </div>
);
