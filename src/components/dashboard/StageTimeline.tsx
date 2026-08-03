import { Fragment } from 'react';
import { SYS } from '../../theme/tokens';
import { shortDate, type ContractStage } from '../../mocks/dashboard';

const toDay = (iso: string | null | undefined) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getTime() / 86400000;
};

export const StageTimeline = ({ s }: { s: ContractStage }) => {
  const d0 = toDay(s.start);
  const d1 = toDay(s.handover);
  if (d0 == null || d1 == null) return null;
  const span = d1 - d0;
  const toX = (d?: string | null) => {
    const day = toDay(d);
    if (day == null) return null;
    return Math.max(0, Math.min(100, ((day - d0) / span) * 100));
  };
  const xMeet = toX(s.meeting);
  const xToday = toX(s.today);
  const fillPct = xToday != null ? xToday : s.readiness ?? 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: SYS.muted, letterSpacing: '0.08em', marginBottom: 6 }}>
        <span>{shortDate(s.start)} · старт</span>
        <span>{shortDate(s.handover)} · сдача</span>
      </div>
      <div style={{ position: 'relative', height: 10, marginTop: 22 }}>
        <div style={{ position: 'absolute', inset: 0, background: '#eae7dc' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${fillPct}%`, background: '#ecab99' }} />
        {xMeet != null && (
          <Fragment>
            <div style={{ position: 'absolute', left: `${xMeet}%`, bottom: 18, transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: SYS.red, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{shortDate(s.meeting)}</div>
            <div title="очная встреча" style={{ position: 'absolute', left: `${xMeet}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: SYS.paper, border: `2px solid ${SYS.red}` }} />
          </Fragment>
        )}
        {(s.extraMarkers || []).map((d, i) => {
          const x = toX(d);
          return x == null ? null : (
            <Fragment key={i}>
              <div style={{ position: 'absolute', left: `${x}%`, bottom: 18, transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: SYS.red, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{shortDate(d)}</div>
              <div title={shortDate(d)} style={{ position: 'absolute', left: `${x}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: SYS.paper, border: `2px solid ${SYS.red}` }} />
            </Fragment>
          );
        })}
        {xToday != null && (
          <div style={{ position: 'absolute', left: `${xToday}%`, top: -6, bottom: -6, width: 0, borderLeft: `2px dashed ${SYS.red}` }} />
        )}
      </div>
      {xToday != null && (
        <div style={{ marginTop: 4, position: 'relative', height: 14 }}>
          <span style={{ position: 'absolute', left: `${xToday}%`, transform: 'translateX(-50%)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: SYS.red, letterSpacing: '0.08em' }}>сегодня · {shortDate(s.today)}</span>
        </div>
      )}
    </div>
  );
};
