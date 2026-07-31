import { useNavigate, useParams } from 'react-router-dom';
import { MonoLabel, Pill } from '../../components/primitives';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useReports } from '../../state/ReportsContext';
import { useStages } from '../../state/StagesContext';
import { formatShort } from '../../mocks/reports';
import { daysSinceStart } from '../../mocks/dashboard';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineBanner } from '../../components/OfflineBanner';

export const ReportDayMobilePage = () => {
  const { user } = useAuth();
  const { projectCode, month, day } = useParams();
  const navigate = useNavigate();
  const { reports } = useReports();
  const { stages } = useStages();
  const online = useOnlineStatus();

  if (!user || !projectCode || !day) return null;
  const report = reports[day];

  const groups = stages
    .map((sp) => ({
      sp,
      tasks: report?.tasks.filter((t) => t.subproject === sp.code) ?? [],
      dayNum: daysSinceStart(sp.start, day),
    }))
    .filter((g) => g.tasks.length > 0);

  const totalTasks = report?.tasks.length ?? 0;
  const totalPhotos = report?.tasks.reduce((s, t) => s + t.photos.length, 0) ?? 0;
  const totalPeople = report?.frontOffice.reduce((s, r) => s + (Number(r.qty) || 0), 0) ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: SYS.paper, color: SYS.ink, display: 'flex', flexDirection: 'column' }}>
      {!online && <OfflineBanner />}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span onClick={() => navigate(`/${projectCode}/reports/${month}`)} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>←</span>
        <MonoLabel color={SYS.ink} style={{ fontSize: 11 }}>отчёт · {formatShort(day)}</MonoLabel>
        <span style={{ width: 18 }} />
      </div>

      {!report ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: SYS.muted, lineHeight: 1.5 }}>За этот день отчёта нет.</p>
        </div>
      ) : (
        <>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', gap: 20 }}>
            <div><MonoLabel color={SYS.muted} style={{ fontSize: 9 }}>задач</MonoLabel><div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500 }}>{totalTasks}</div></div>
            <div><MonoLabel color={SYS.muted} style={{ fontSize: 9 }}>фото</MonoLabel><div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500 }}>{totalPhotos}</div></div>
            <div><MonoLabel color={SYS.muted} style={{ fontSize: 9 }}>человек</MonoLabel><div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500 }}>{totalPeople}</div></div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 20px' }} className="sys-modal-scroll">
            {groups.map(({ sp, tasks, dayNum }) => (
              <div key={sp.code} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <MonoLabel color={SYS.red} style={{ fontSize: 10 }}>{sp.code}</MonoLabel>
                    <div style={{ marginTop: 3, fontSize: 14.5, fontWeight: 500 }}>{sp.title}</div>
                  </div>
                  {dayNum !== null && dayNum > 0 && <MonoLabel color={SYS.muted} style={{ fontSize: 9.5 }}>{dayNum}-й день</MonoLabel>}
                </div>
                {tasks.map((t) => (
                  <div key={t.id} style={{ border: `1px solid ${SYS.line}`, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: t.photos.length ? 12 : 0 }}>
                      <span style={{ fontSize: 14, lineHeight: 1.4 }}>{t.title}</span>
                      <Pill tone="ghost" color={t.kind === 'field' ? SYS.muted : SYS.ink}>{t.kind === 'field' ? 'полевая' : 'кабинетная'}</Pill>
                    </div>
                    {t.photos.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {t.photos.map((p) => (
                          <div key={p.id} style={{ aspectRatio: '1', background: '#eae7dc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: SYS.muted, overflow: 'hidden' }}>
                            {p.url ? <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '▤'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginTop: 4 }}>
              <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 10 }}>занятые люди в этот день</MonoLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                {report.frontOffice.length > 0
                  ? report.frontOffice.map((r, i) => <div key={i}>{r.qty} чел. · {r.role}</div>)
                  : '—'}
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 20px', borderTop: `1px solid ${SYS.line}`, textAlign: 'center' }}>
            <MonoLabel color={SYS.muted} style={{ fontSize: 9 }}>только просмотр · правка недоступна</MonoLabel>
          </div>
        </>
      )}
    </div>
  );
};
