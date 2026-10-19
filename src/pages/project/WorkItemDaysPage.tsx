import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MonoLabel } from '../../components/primitives';
import { PageHeader } from '../../components/PageHeader';
import { SYS } from '../../theme/tokens';
import { useStages } from '../../state/StagesContext';
import { useReports } from '../../state/ReportsContext';
import { formatLong } from '../../mocks/reports';

// "1 задача" / "2 задачи" / "5 задач" — standard Russian plural rules.
const taskWord = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'задачи';
  return 'задач';
};

export const WorkItemDaysPage = () => {
  const { projectCode, workItemId } = useParams();
  const navigate = useNavigate();
  const { stages } = useStages();
  const { getDaysForWorkItem } = useReports();
  const [days, setDays] = useState<{ date: string; count: number }[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const stage = stages.find((s) => s.workItems.some((w) => w.id === workItemId));
  const workItem = stage?.workItems.find((w) => w.id === workItemId);

  useEffect(() => {
    if (!workItemId) return;
    setDays(null);
    getDaysForWorkItem(workItemId).then((res) => {
      if (res.error) setError(res.error);
      setDays(res.days);
      setTotal(res.total);
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
        meta={days ? `${days.length} ${days.length === 1 ? 'день' : 'дней'}, где встречается эта задача в отчётах` : 'загрузка…'}
        right={workItem && days && (
          <div style={{ display: 'flex', border: `1px solid ${SYS.line}`, background: SYS.paper }}>
            <div style={{ padding: '14px 22px' }}>
              <MonoLabel color={SYS.muted} style={{ fontSize: 9.5 }}>всего</MonoLabel>
              <div style={{ marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 500, textAlign: 'center' }}>{total}</div>
            </div>
          </div>
        )}
      />

      {!workItem ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '48px 40px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: SYS.muted }}>Эта работа удалена или не относится к текущему объекту.</p>
        </div>
      ) : error ? (
        <div style={{ border: `1px dashed ${SYS.red}`, background: SYS.paper, padding: '24px 28px', fontSize: 13, color: SYS.red }}>
          Не удалось загрузить дни: {error}
        </div>
      ) : days === null ? (
        <div style={{ padding: '24px 0', fontSize: 13, color: SYS.muted }}>Загрузка…</div>
      ) : days.length === 0 ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '48px 40px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, color: SYS.muted }}>Пока ни одна задача в отчётах не привязана к этой работе.</p>
        </div>
      ) : (
        <section style={{ border: `1px solid ${SYS.line}` }}>
          {days.map(({ date, count }, i) => (
            <div
              key={date}
              onClick={() => navigate(`/${projectCode}/reports/${date.slice(0, 7)}/${date}`)}
              style={{
                padding: '16px 24px', borderTop: i === 0 ? 'none' : `1px solid ${SYS.line}`, background: SYS.paper,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14 }}>{formatLong(date)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <MonoLabel color={SYS.red} style={{ fontSize: 10.5 }}>{count} {taskWord(count)}</MonoLabel>
                <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>{date} →</MonoLabel>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
};
