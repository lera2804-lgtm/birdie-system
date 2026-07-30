import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MonoLabel, Pill } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { PageHeader } from '../../components/PageHeader';
import { SectionHead } from '../../components/SectionHead';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useReports } from '../../state/ReportsContext';
import { useStages } from '../../state/StagesContext';
import { addDays, formatLong, weekdayShort, REPORT_MONTH, SUBPROJECTS, type ReportTask } from '../../mocks/reports';
import { daysSinceStart } from '../../mocks/dashboard';
import { PROJECT_INFO } from '../../mocks/project';
import { PhotoLightbox } from '../../components/reports/PhotoLightbox';
import { EditReportModal } from '../../components/reports/EditReportModal';

const WEEKDAY_NAMES = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

const TaskThumbGrid = ({ task, onOpen }: { task: ReportTask; onOpen: (index: number) => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 4 * 96 + 3 * 8 }}>
    {task.photos.map((p, i) => (
      <div
        key={p.id}
        title="открыть фото"
        onClick={() => onOpen(i)}
        style={{ position: 'relative', width: 96, height: 96, background: '#eae7dc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: SYS.muted, cursor: 'pointer', overflow: 'hidden' }}
      >
        {p.url ? <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '▤'}
        <span style={{ position: 'absolute', right: 5, bottom: 4, fontSize: 11, color: SYS.ink, background: 'rgba(255,255,255,0.7)' }}>⤢</span>
      </div>
    ))}
  </div>
);

export const ReportDayPage = () => {
  const { user } = useAuth();
  const { projectCode, month, day } = useParams();
  const navigate = useNavigate();
  const { reports } = useReports();
  const { stages } = useStages();
  const [lightbox, setLightbox] = useState<{ task: ReportTask; index: number } | null>(null);
  const [editing, setEditing] = useState(false);

  if (!user || !projectCode || !day) return null;
  // Drafts aren't published yet — clients must not see them as if they were.
  const rawReport = reports[day];
  const report = user.role === 'client' && rawReport?.isDraft ? undefined : rawReport;
  const canEdit = user.role === 'admin' || user.role === 'project_manager';

  const groups = SUBPROJECTS
    .map((sp) => ({
      sp,
      tasks: report?.tasks.filter((t) => t.subproject === sp.code) ?? [],
      dayNum: daysSinceStart(stages.find((s) => s.code === sp.code)?.start, day),
    }))
    .filter((g) => g.tasks.length > 0);

  const totalTasks = report?.tasks.length ?? 0;
  const totalPhotos = report?.tasks.reduce((s, t) => s + t.photos.length, 0) ?? 0;
  const totalPeople = (report?.frontOffice.reduce((s, r) => s + (Number(r.qty) || 0), 0) ?? 0) + (report?.backOffice.reduce((s, r) => s + (Number(r.qty) || 0), 0) ?? 0);

  const weekStrip = Array.from({ length: 7 }, (_, i) => addDays(day, i - 3));
  const [y, m, d] = day.split('-').map(Number);
  const weekdayName = WEEKDAY_NAMES[new Date(y, m - 1, d).getDay()];

  return (
    <main style={{ position: 'relative', padding: '36px 56px 56px' }}>
      <a
        onClick={() => navigate(`/${projectCode}/reports/${month || REPORT_MONTH}`)}
        style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none', cursor: 'pointer' }}
      >
        ← {month || REPORT_MONTH}
      </a>

      <div style={{ marginTop: 14, marginBottom: 20, display: 'flex', border: `1px solid ${SYS.line}`, background: SYS.paper }}>
        {weekStrip.map((wd, i) => {
          const wReport = reports[wd];
          const isCurrent = wd === day;
          return (
            <a
              key={wd}
              onClick={() => wReport && navigate(`/${projectCode}/reports/${month || REPORT_MONTH}/${wd}`)}
              style={{
                flex: 1, textAlign: 'center', padding: '14px 6px', cursor: wReport ? 'pointer' : 'default',
                background: isCurrent ? SYS.ink : SYS.paper, color: isCurrent ? '#fff' : SYS.ink,
                borderRight: i < 6 ? `1px solid ${SYS.line}` : 'none',
                textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
              }}
            >
              <MonoLabel color={isCurrent ? 'rgba(255,255,255,0.6)' : SYS.muted} style={{ fontSize: 9 }}>{weekdayShort(wd)}</MonoLabel>
              <span style={{ fontSize: 18, fontWeight: isCurrent ? 600 : 400 }}>{Number(wd.split('-')[2])}</span>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: wReport ? (isCurrent ? '#fff' : SYS.red) : 'transparent' }} />
            </a>
          );
        })}
      </div>

      <PageHeader
        kicker={`отчёт дня · ${weekdayName}`}
        title={formatLong(day)}
        meta={
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{PROJECT_INFO[projectCode].code} · {report ? `${groups.length} ${pluralProject(groups.length)} в работе сегодня` : 'нет отчёта за этот день'}</span>
            {report?.editedByPM && user.role !== 'client' && (
              <>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: SYS.line, flex: 'none' }} />
                <span style={{ color: SYS.ink2 }}>{report.editedByPM}</span>
              </>
            )}
          </span>
        }
        right={report && (
          <>
            <div style={{ display: 'flex', border: `1px solid ${SYS.line}`, background: SYS.paper }}>
              <div style={{ padding: '14px 22px' }}><MonoLabel color={SYS.muted} style={{ fontSize: 9.5 }}>задач</MonoLabel><div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 500 }}>{totalTasks}</div></div>
              <div style={{ padding: '14px 22px', borderLeft: `1px solid ${SYS.line}` }}><MonoLabel color={SYS.muted} style={{ fontSize: 9.5 }}>фото</MonoLabel><div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 500 }}>{totalPhotos}</div></div>
              <div style={{ padding: '14px 22px', borderLeft: `1px solid ${SYS.line}` }}><MonoLabel color={SYS.muted} style={{ fontSize: 9.5 }}>человек</MonoLabel><div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 500 }}>{totalPeople}</div></div>
            </div>
            {canEdit && <SysButton tone="ghost" full={false} small type="button" onClick={() => setEditing(true)}>✎ Изменить</SysButton>}
          </>
        )}
      />

      {!report ? (
        <section style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: SYS.muted, margin: '0 auto 18px' }}>◷</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.008em' }}>За этот день отчёта нет</h2>
          <p style={{ margin: '0 auto', fontSize: 14, color: SYS.muted, lineHeight: 1.55, maxWidth: 420 }}>
            {user.role === 'client' ? 'В этот день работы не велись или отчёт ещё не опубликован. Загляните в соседние дни календаря.' : 'Отчёт за этот день ещё не создан.'}
          </p>
        </section>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
            {groups.map(({ sp, tasks, dayNum }) => (
              <section key={sp.code} style={{ background: SYS.paper, border: `1px solid ${SYS.line}` }}>
                <SectionHead
                  kicker={sp.code}
                  title={sp.title}
                  action={dayNum !== null && <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{dayNum}-й день проекта</MonoLabel>}
                />
                <div style={{ padding: '0 24px 4px' }}>
                  {tasks.map((t, i) => (
                    <div key={t.id} style={{ padding: '18px 0', borderTop: i === 0 ? 'none' : `1px solid ${SYS.line}`, display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 16, alignItems: t.photos.length ? 'flex-start' : 'center' }}>
                      <MonoLabel color={SYS.muted} style={{ fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</MonoLabel>
                      <div>
                        <div style={{ marginBottom: t.photos.length ? 12 : 0 }}><span style={{ fontSize: 14.5, lineHeight: 1.4 }}>{t.title}</span></div>
                        {t.photos.length > 0 && <TaskThumbGrid task={t} onOpen={(index) => setLightbox({ task: t, index })} />}
                      </div>
                      <Pill tone="ghost" color={t.kind === 'field' ? SYS.muted : SYS.ink}>{t.kind === 'field' ? 'полевая' : 'кабинетная'}</Pill>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section style={{ background: SYS.paper, border: `1px solid ${SYS.line}`, padding: '22px 24px' }}>
            <MonoLabel color={SYS.ink} style={{ fontSize: 10, display: 'block', marginBottom: 16 }}>занятые люди сегодня</MonoLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Фронт-офис</MonoLabel>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
                  {report.frontOffice.length > 0
                    ? report.frontOffice.map((r, i) => <div key={i}>{r.qty} чел. · {r.role}</div>)
                    : '—'}
                </div>
              </div>
              <div>
                <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>Бэк-офис</MonoLabel>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
                  {report.backOffice.length > 0
                    ? report.backOffice.map((r, i) => <div key={i}>{r.qty} чел. · {r.role}</div>)
                    : '—'}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {lightbox && (
        <PhotoLightbox
          photos={lightbox.task.photos}
          startIndex={lightbox.index}
          subtitle={`${lightbox.task.subproject} · ${lightbox.task.title}`}
          onClose={() => setLightbox(null)}
        />
      )}

      {editing && report && <EditReportModal date={day} report={report} onClose={() => setEditing(false)} />}
    </main>
  );
};

function pluralProject(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'проект';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'проекта';
  return 'проектов';
}
