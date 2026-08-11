import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MonoLabel, Pill } from '../../components/primitives';
import { SysButton, SysSelectField } from '../../components/form';
import { PageHeader } from '../../components/PageHeader';
import { SYS, FONT_SANS } from '../../theme/tokens';
import { ContractStageCard } from '../../components/dashboard/ContractStageCard';
import { EditStageModal } from '../../components/dashboard/EditStageModal';
import { NewStageModal } from '../../components/dashboard/NewStageModal';
import { useObjectRole } from '../../state/ObjectRoleContext';
import { useStages } from '../../state/StagesContext';
import { useProjectDetails } from '../../state/ProjectDetailsContext';

type ReadinessFilter = 'all' | 'active' | 'done';
type SortKey = 'default' | 'date-asc' | 'date-desc' | 'number-asc' | 'number-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'без сортировки' },
  { value: 'date-asc', label: 'по дате: сначала ранние' },
  { value: 'date-desc', label: 'по дате: сначала поздние' },
  { value: 'number-asc', label: 'по номеру: по возрастанию' },
  { value: 'number-desc', label: 'по номеру: по убыванию' },
];

export const DashboardPage = () => {
  const role = useObjectRole();
  const { projectCode } = useParams();
  const { stages, loading } = useStages();
  const { details } = useProjectDetails();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const sortByStart = (list: typeof stages, dir: 1 | -1) =>
    [...list].sort((a, b) => {
      if (!a.start && !b.start) return 0;
      if (!a.start) return 1;
      if (!b.start) return -1;
      return a.start.localeCompare(b.start) * dir;
    });

  const filteredStages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stages.filter((s) => {
      if (q && !s.code.toLowerCase().includes(q) && !s.title.toLowerCase().includes(q)) return false;
      if (readinessFilter === 'done' && s.readiness !== 100) return false;
      if (readinessFilter === 'active' && s.readiness === 100) return false;
      return true;
    });
  }, [stages, search, readinessFilter]);

  // Default order: active projects first (newest start date first), then a
  // divider, then completed ones (earliest start date first) — an explicit
  // sort choice below overrides this grouping with a flat list.
  const defaultGroups = useMemo(() => {
    const active = filteredStages.filter((s) => s.readiness !== 100);
    const done = filteredStages.filter((s) => s.readiness === 100);
    return { active: sortByStart(active, -1), done: sortByStart(done, 1) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStages]);

  const visibleStages = useMemo(() => {
    if (sortKey === 'default') return [...defaultGroups.active, ...defaultGroups.done];
    if (sortKey === 'date-asc' || sortKey === 'date-desc') {
      return sortByStart(filteredStages, sortKey === 'date-asc' ? 1 : -1);
    }
    const dir = sortKey === 'number-asc' ? 1 : -1;
    return [...filteredStages].sort((a, b) => (a.position - b.position) * dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStages, defaultGroups, sortKey]);

  if (!role || !projectCode) return null;
  const canEdit = role === 'admin' || role === 'project_manager';
  const editingStage = stages.find((s) => s.code === editingCode) ?? null;

  return (
    <main style={{ padding: '36px 56px 56px' }}>
      <PageHeader
        kicker="дашборд объекта"
        title={projectCode}
        meta={details.address}
        right={
          <>
            {!canEdit && <Pill tone="ghost">только просмотр</Pill>}
            {canEdit && <SysButton tone="fill" full={false} small type="button" onClick={() => setCreating(true)}>+ Создать проект</SysButton>}
          </>
        }
      />

      {!loading && stages.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', minWidth: 200 }}>
            <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>поиск</MonoLabel>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="по коду или названию"
              style={{
                marginTop: 8, width: '100%', border: `1px solid ${SYS.line}`, background: SYS.paper,
                padding: '13px 14px', fontFamily: FONT_SANS, fontSize: 14, color: SYS.ink, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <SysSelectField
            label="готовность"
            style={{ flex: '0 0 200px' }}
            value={readinessFilter}
            onChange={(e: any) => setReadinessFilter(e.target.value as ReadinessFilter)}
            options={[
              { value: 'all', label: 'все' },
              { value: 'active', label: 'в работе' },
              { value: 'done', label: 'завершён' },
            ]}
          />
          <SysSelectField
            label="сортировка"
            style={{ flex: '0 0 240px' }}
            value={sortKey}
            onChange={(e: any) => setSortKey(e.target.value as SortKey)}
            options={SORT_OPTIONS}
          />
        </div>
      )}

      {loading ? (
        <MonoLabel color={SYS.muted}>Загрузка…</MonoLabel>
      ) : stages.length === 0 ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '56px 40px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 500, letterSpacing: '-0.008em' }}>На объекте пока нет проектов</h2>
          <p style={{ margin: '0 auto', fontSize: 13.5, color: SYS.muted, lineHeight: 1.55, maxWidth: 420 }}>
            {canEdit ? 'Создайте первый проект — тематическую группу работ со своими сроками и составом задач.' : 'Как только менеджер добавит проект, он появится здесь.'}
          </p>
        </div>
      ) : visibleStages.length === 0 ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '56px 40px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 500, letterSpacing: '-0.008em' }}>Ничего не найдено</h2>
          <p style={{ margin: '0 auto', fontSize: 13.5, color: SYS.muted, lineHeight: 1.55, maxWidth: 420 }}>Измените поиск или фильтр, чтобы увидеть проекты.</p>
        </div>
      ) : sortKey === 'default' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {defaultGroups.active.map((s) => (
            <ContractStageCard key={s.code} s={s} canEdit={canEdit} onEdit={() => setEditingCode(s.code)} />
          ))}
          {defaultGroups.active.length > 0 && defaultGroups.done.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: SYS.line }} />
              <MonoLabel color={SYS.muted} style={{ fontSize: 10 }}>завершённые</MonoLabel>
              <div style={{ flex: 1, height: 1, background: SYS.line }} />
            </div>
          )}
          {defaultGroups.done.map((s) => (
            <ContractStageCard key={s.code} s={s} canEdit={canEdit} onEdit={() => setEditingCode(s.code)} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {visibleStages.map((s) => (
            <ContractStageCard key={s.code} s={s} canEdit={canEdit} onEdit={() => setEditingCode(s.code)} />
          ))}
        </div>
      )}

      {editingStage && <EditStageModal stage={editingStage} onClose={() => setEditingCode(null)} />}
      {creating && <NewStageModal projectCode={projectCode} onClose={() => setCreating(false)} />}
    </main>
  );
};
