import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OrlovMark, MonoLabel, RoleBadge, Pill } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useObjectRole } from '../../state/ObjectRoleContext';
import { useReports } from '../../state/ReportsContext';
import { monthGrid, monthLabel, shiftMonth, currentMonth, todayISO, addDays, formatShort } from '../../mocks/reports';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { NewReportMobileView } from '../../components/reports/NewReportMobileView';
import { EditReportMobileView } from '../../components/reports/EditReportMobileView';

export const ReportsMobilePage = () => {
  const { user, logout } = useAuth();
  const role = useObjectRole();
  const { projectCode, month: monthParam } = useParams();
  const navigate = useNavigate();
  const { reports } = useReports();
  const online = useOnlineStatus();
  const [composingDate, setComposingDate] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  if (!user || !role || !projectCode) return null;
  const month = monthParam || currentMonth();
  const today = todayISO();
  const yesterday = addDays(today, -1);

  // This page is Object Manager only (see ReportsSection) — they only need
  // to reach today or a recent day quickly, so future days of the month
  // just add scrolling with nothing to show.
  const days = monthGrid(month)
    .filter((c) => c.inMonth && c.date <= today)
    .reverse();
  const todayReport = month === currentMonth() ? reports[today] : undefined;
  const noToday = month === currentMonth() && !todayReport;
  const label = monthLabel(month);

  return (
    <div style={{ minHeight: '100vh', background: SYS.paper, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      {!online && <OfflineBanner />}

      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${SYS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <OrlovMark size={10} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <RoleBadge role={role} size="sm" />
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }}
              style={{ fontSize: 11, color: SYS.muted, textDecoration: 'none' }}
            >
              выход ↗
            </a>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              style={{ display: 'inline-block', textDecoration: 'none', cursor: 'pointer' }}
            >
              <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>← {projectCode} · отчёты</MonoLabel>
            </a>
            <h1 style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>{label.nominative}</h1>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => navigate(`/${projectCode}/reports/${shiftMonth(month, -1)}`)} style={{ width: 32, height: 32, background: SYS.paper, color: SYS.ink, border: `1px solid ${SYS.line}`, fontSize: 13 }}>←</button>
            <button type="button" onClick={() => navigate(`/${projectCode}/reports/${shiftMonth(month, 1)}`)} style={{ width: 32, height: 32, background: SYS.paper, color: SYS.ink, border: `1px solid ${SYS.line}`, fontSize: 13 }}>→</button>
          </div>
        </div>
      </div>

      {noToday ? (
        <div style={{ padding: '20px 20px 8px' }}>
          <div style={{ border: `1px dashed ${SYS.line}`, background: '#fbf1ee', padding: 20, textAlign: 'center' }}>
            <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>{formatShort(today)} · сегодня</MonoLabel>
            <div style={{ margin: '8px 0 14px', fontSize: 15, fontWeight: 500 }}>Отчёта за сегодня ещё нет</div>
            <SysButton tone="fill" small type="button" onClick={() => setComposingDate(today)}>+ Создать отчёт за сегодня</SysButton>
          </div>
        </div>
      ) : month === currentMonth() && todayReport?.isDraft ? (
        <div style={{ padding: '16px 20px' }}>
          <SysButton tone="fill" small type="button" onClick={() => setComposingDate(today)}>+ Продолжить черновик за сегодня</SysButton>
        </div>
      ) : null}

      <div style={{ flex: 1, overflow: 'auto' }} className="sys-modal-scroll">
        {days.map((c) => {
          const report = reports[c.date];
          const isToday = c.date === today;
          const isEditable = isToday || c.date === yesterday;
          if (noToday && isToday) return null;
          return (
            <a
              key={c.date}
              onClick={() => {
                if (!report) return;
                if (report.isDraft) setComposingDate(c.date);
                else navigate(`/${projectCode}/reports/${month}/${c.date}`);
              }}
              style={{
                display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 24, alignItems: 'center',
                padding: '14px 20px', borderBottom: `1px solid ${SYS.line}`,
                background: isToday ? '#fbf1ee' : 'transparent',
                boxShadow: isToday ? `inset 3px 0 0 ${SYS.red}` : 'none',
                textDecoration: 'none', color: 'inherit', cursor: report ? 'pointer' : 'default',
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500, color: isToday ? SYS.red : SYS.ink }}>{formatShort(c.date)}</div>
              <div>
                {report?.isDraft ? (
                  <Pill tone="ghost" color={SYS.muted}>черновик</Pill>
                ) : report?.milestone ? (
                  <div style={{ fontSize: 13, lineHeight: 1.35 }}>★ {report.milestone}</div>
                ) : report ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isToday ? SYS.red : '#ecab99' }} />
                    <span style={{ fontSize: 13, color: SYS.ink2 }}>Отчёт опубликован</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 13, color: SYS.muted }}>Нет отчёта</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end' }}>
                {isToday && <Pill tone="fill">сегодня</Pill>}
                {isEditable && report && !report.isDraft && (
                  <span onClick={(e) => { e.stopPropagation(); setEditingDate(c.date); }} style={{ fontSize: 12, color: SYS.ink, cursor: 'pointer', whiteSpace: 'nowrap' }}>✎ изменить</span>
                )}
              </div>
            </a>
          );
        })}
      </div>

      <div style={{ padding: '14px 20px', borderTop: `1px solid ${SYS.line}`, textAlign: 'center' }}>
        <MonoLabel color={SYS.muted} style={{ fontSize: 9 }}>orlov · red</MonoLabel>
      </div>

      {composingDate && (
        <NewReportMobileView date={composingDate} existing={reports[composingDate]} onClose={() => setComposingDate(null)} />
      )}
      {editingDate && reports[editingDate] && (
        <EditReportMobileView date={editingDate} report={reports[editingDate]} onClose={() => setEditingDate(null)} />
      )}
    </div>
  );
};
