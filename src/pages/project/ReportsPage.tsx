import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MonoLabel } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { PageHeader } from '../../components/PageHeader';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useReports } from '../../state/ReportsContext';
import { monthGrid, monthLabel, shiftMonth, REPORT_MONTH, REPORT_TODAY } from '../../mocks/reports';
import { PROJECT_INFO } from '../../mocks/project';
import { NewReportModal } from '../../components/reports/NewReportModal';

const WEEKDAY_HEADERS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export const ReportsPage = () => {
  const { user } = useAuth();
  const { projectCode, month: monthParam } = useParams();
  const navigate = useNavigate();
  const { reports } = useReports();
  const [creatingDate, setCreatingDate] = useState<string | null>(null);

  if (!user || !projectCode) return null;
  const month = monthParam || REPORT_MONTH;
  const canCreate = user.role === 'admin' || user.role === 'project_manager' || user.role === 'site_manager';

  const grid = monthGrid(month);
  const cellsInMonth = grid.filter((c) => c.inMonth);
  const reportedCount = cellsInMonth.filter((c) => reports[c.date]).length;
  const isEmpty = reportedCount === 0;
  const label = monthLabel(month);

  const milestones = cellsInMonth
    .map((c) => ({ cell: c, report: reports[c.date] }))
    .filter((x) => x.report?.milestone);

  return (
    <main style={{ padding: '36px 56px 56px' }}>
      <PageHeader
        kicker="отчёты · хронологию реализации"
        title={label.nominative}
        meta={`${PROJECT_INFO[projectCode].code} · ${isEmpty ? 'нет отчётов' : `${reportedCount} отчётных ${pluralDay(reportedCount)}`}`}
        right={
          <>
            <button
              type="button"
              onClick={() => navigate(`/${projectCode}/reports/${shiftMonth(month, -1)}`)}
              style={{ width: 40, height: 40, background: SYS.paper, color: SYS.ink, border: `1px solid ${SYS.line}`, cursor: 'pointer', fontSize: 15 }}
            >←</button>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: SYS.muted, letterSpacing: '0.1em', minWidth: 80, textAlign: 'center' }}>
              <span style={{ color: SYS.ink }}>{label.monthOnly.toUpperCase()}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/${projectCode}/reports/${shiftMonth(month, 1)}`)}
              style={{ width: 40, height: 40, background: SYS.paper, color: SYS.ink, border: `1px solid ${SYS.line}`, cursor: 'pointer', fontSize: 15 }}
            >→</button>
          </>
        }
      />

      <section style={{ background: SYS.paper, border: `1px solid ${SYS.line}`, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: `1px solid ${SYS.line}` }}>
          {WEEKDAY_HEADERS.map((d, i) => (
            <div key={d} style={{ padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em', color: i >= 5 ? SYS.red : SYS.muted, borderRight: i < 6 ? `1px solid ${SYS.line}` : 'none' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {grid.map((c, i) => {
            const report = reports[c.date];
            const isToday = c.date === REPORT_TODAY;
            const isWeekend = i % 7 >= 5;
            const clickable = c.inMonth && !!report;
            const canAdd = c.inMonth && !report && canCreate;
            return (
              <div key={c.date} style={{ borderBottom: i < grid.length - 7 ? `1px solid ${SYS.line}` : 'none', borderRight: (i + 1) % 7 !== 0 ? `1px solid ${SYS.line}` : 'none' }}>
                <div
                  onClick={() => clickable && navigate(`/${projectCode}/reports/${month}/${c.date}`)}
                  style={{
                    position: 'relative', minHeight: 112, padding: '14px 16px 12px',
                    background: isToday ? '#fbf1ee' : SYS.paper,
                    opacity: c.inMonth ? 1 : 0.3,
                    boxShadow: isToday ? `inset 3px 0 0 ${SYS.red}` : 'none',
                    display: 'flex', flexDirection: 'column',
                    cursor: clickable ? 'pointer' : 'default', minWidth: 0, boxSizing: 'border-box', height: '100%',
                  }}
                >
                  {canAdd && (
                    <span
                      title="добавить отчёт"
                      onClick={(e) => { e.stopPropagation(); setCreatingDate(c.date); }}
                      style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, lineHeight: 1, color: SYS.ink, cursor: 'pointer' }}
                    >+</span>
                  )}
                  <span style={{ fontSize: isToday ? 22 : 18, fontWeight: isToday ? 700 : 400, color: isToday ? SYS.red : isWeekend ? SYS.muted : SYS.ink, letterSpacing: '-0.01em', lineHeight: 1 }}>{c.dayNum}</span>
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {report?.milestone ? (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.04em', padding: '4px 7px', background: SYS.ink, color: '#fff', lineHeight: 1.4, wordBreak: 'break-word' }}>★ {report.milestone}</div>
                    ) : report ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isToday ? SYS.red : '#ecab99' }} />
                        <MonoLabel color={isToday ? SYS.red : SYS.muted} style={{ fontSize: 9 }}>отчёт</MonoLabel>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', fontSize: 11, color: SYS.muted, background: SYS.bg }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ecab99' }} /> есть фотоотчёт</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ padding: '2px 6px', background: SYS.ink, color: '#fff', fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>★</span> веха</span>
          <MonoLabel color={SYS.muted} style={{ marginLeft: 'auto' }}>нажмите день → отчёт дня</MonoLabel>
        </div>
      </section>

      {isEmpty ? (
        <section style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '56px 40px', textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: SYS.muted, margin: '0 auto 18px' }}>◷</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.008em' }}>За этот месяц ещё нет отчётов</h2>
          <p style={{ margin: '0 auto 22px', fontSize: 14, color: SYS.muted, lineHeight: 1.55, maxWidth: 460 }}>
            {canCreate ? 'Отчёты появляются здесь по мере работы на площадке. Создайте первый отчёт за сегодня.' : 'Как только менеджер объекта опубликует отчёт, он появится в календаре. Загляните позже.'}
          </p>
          {canCreate && <SysButton tone="fill" full={false} type="button" onClick={() => setCreatingDate(REPORT_TODAY)}>+ Отчёт за сегодня</SysButton>}
        </section>
      ) : (
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <MonoLabel color={SYS.red}>вехи {label.genitive}</MonoLabel>
            <span style={{ flex: 1, height: 1, background: SYS.line }} />
            <MonoLabel color={SYS.muted}>{milestones.length} события</MonoLabel>
          </div>
          {milestones.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: SYS.line, border: `1px solid ${SYS.line}` }}>
              {milestones.map(({ cell, report }) => (
                <a
                  key={cell.date}
                  onClick={() => navigate(`/${projectCode}/reports/${month}/${cell.date}`)}
                  style={{ background: SYS.paper, padding: '20px 20px 22px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 500 }}>{cell.dayNum}</div>
                    <MonoLabel color={SYS.muted}>{label.genitive}</MonoLabel>
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: SYS.red }}>→</span>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.4, flex: 1 }}>{report?.milestone}</div>
                  {report?.milestoneTag && <div style={{ marginTop: 10, fontSize: 10.5, color: SYS.red, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>★ {report.milestoneTag}</div>}
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {creatingDate && <NewReportModal date={creatingDate} onClose={() => setCreatingDate(null)} />}
    </main>
  );
};

function pluralDay(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'дня';
  return 'дней';
}
