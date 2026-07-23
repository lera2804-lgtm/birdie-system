import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import type { StageEvent } from '../../mocks/dashboard';

export const EventColumn = ({ label, sub, tone, events }: { label: string; sub: string; tone: 'plan' | 'fact'; events: StageEvent[] }) => {
  const groups: { month: string; items: StageEvent[] }[] = [];
  for (const e of events) {
    let g = groups.find((x) => x.month === e.month);
    if (!g) { g = { month: e.month, items: [] }; groups.push(g); }
    g.items.push(e);
  }
  return (
    <div style={{ border: `1px solid ${SYS.line}` }}>
      <div style={{ padding: '10px 14px', background: tone === 'fact' ? '#f3d9d1' : '#e7e3d8', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>{label}</MonoLabel>
        <MonoLabel color={SYS.ink2} style={{ fontSize: 9 }}>{sub}</MonoLabel>
      </div>
      <div style={{ padding: '12px 14px 16px', minHeight: 60 }}>
        {groups.length === 0 && <div style={{ fontSize: 11, color: SYS.muted }}>— нет событий —</div>}
        {groups.map((g, gi) => (
          <div key={g.month} style={{ marginBottom: gi === groups.length - 1 ? 0 : 12 }}>
            <MonoLabel color={SYS.muted} style={{ fontSize: 9.5 }}>{g.month}</MonoLabel>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.items.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, width: 40, flex: 'none' }}>{e.date}</span>
                  <span style={{ fontSize: 11.5, lineHeight: 1.35 }}>{e.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
