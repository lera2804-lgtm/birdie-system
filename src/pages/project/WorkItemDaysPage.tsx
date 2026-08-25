import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MonoLabel } from '../../components/primitives';
import { PageHeader } from '../../components/PageHeader';
import { SYS } from '../../theme/tokens';
import { useStages } from '../../state/StagesContext';
import { useReports } from '../../state/ReportsContext';
import { formatLong } from '../../mocks/reports';

export const WorkItemDaysPage = () => {
  const { projectCode, workItemId } = useParams();
  const navigate = useNavigate();
  const { stages } = useStages();
  const { getDaysForWorkItem } = useReports();
  const [dates, setDates] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stage = stages.find((s) => s.workItems.some((w) => w.id === workItemId));
  const workItem = stage?.workItems.find((w) => w.id === workItemId);

  useEffect(() => {
    if (!workItemId) return;
    setDates(null);
    getDaysForWorkItem(workItemId).then((res) => {
      if (res.error) setError(res.error);
      setDates(res.dates);
    });
  }, [workItemId]);

  if (!projectCode || !workItemId) return null;

  return (
    <main style={{ padding: '36px 56px 56px' }}>
      <a
        onClick={() => navigate(`/${projectCode}/dashboard`)}
        style={{ fontSize: 12, color: SYS.muted, textDecoration: 'none', cursor: 'pointer' }}
      >
        ← дашборд
      </a>

      <PageHeader
        kicker={stage ? `${stage.code} · состав работ` : 'состав работ'}
        title={workItem ? (workItem.tag ? `${workItem.tag} · ${workItem.title}` : workItem.title) : 'Работа не найдена'}
        meta={dates ? `${dates.length} ${dates.length === 1 ? 'день' : 'дней'}, где встречается эта задача в отчётах` : 'загрузка…'}
      />

      {!workItem ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '48px 40px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: SYS.muted }}>Эта работа удалена или не относится к текущему объекту.</p>
        </div>
      ) : error ? (
        <div style={{ border: `1px dashed ${SYS.red}`, background: SYS.paper, padding: '24px 28px', fontSize: 13, color: SYS.red }}>
          Не удалось загрузить дни: {error}
        </div>
      ) : dates === null ? (
        <div style={{ padding: '24px 0', fontSize: 13, color: SYS.muted }}>Загрузка…</div>
      ) : dates.length === 0 ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '48px 40px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: SYS.muted }}>Пока ни одна задача в отчётах не привязана к этой работе.</p>
        </div>
      ) : (
        <section style={{ border: `1px solid ${SYS.line}` }}>
          {dates.map((date, i) => (
            <div
              key={date}
              onClick={() => navigate(`/${projectCode}/reports/${date.slice(0, 7)}/${date}`)}
              style={{
                padding: '16px 24px', borderTop: i === 0 ? 'none' : `1px solid ${SYS.line}`, background: SYS.paper,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14 }}>{formatLong(date)}</span>
              <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{date} →</MonoLabel>
            </div>
          ))}
        </section>
      )}
    </main>
  );
};
