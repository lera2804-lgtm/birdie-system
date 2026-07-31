import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MonoLabel, Pill } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { PageHeader } from '../../components/PageHeader';
import { SYS } from '../../theme/tokens';
import { ContractStageCard } from '../../components/dashboard/ContractStageCard';
import { EditStageModal } from '../../components/dashboard/EditStageModal';
import { NewStageModal } from '../../components/dashboard/NewStageModal';
import { useObjectRole } from '../../state/ObjectRoleContext';
import { useStages } from '../../state/StagesContext';
import { useProjectDetails } from '../../state/ProjectDetailsContext';

export const DashboardPage = () => {
  const role = useObjectRole();
  const { projectCode } = useParams();
  const { stages, loading } = useStages();
  const { details } = useProjectDetails();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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

      {loading ? (
        <MonoLabel color={SYS.muted}>Загрузка…</MonoLabel>
      ) : stages.length === 0 ? (
        <div style={{ border: `1px dashed ${SYS.line}`, background: SYS.paper, padding: '56px 40px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 500, letterSpacing: '-0.008em' }}>На объекте пока нет проектов</h2>
          <p style={{ margin: '0 auto', fontSize: 13.5, color: SYS.muted, lineHeight: 1.55, maxWidth: 420 }}>
            {canEdit ? 'Создайте первый проект — тематическую группу работ со своими сроками и составом задач.' : 'Как только менеджер добавит проект, он появится здесь.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {stages.map((s) => (
            <ContractStageCard key={s.code} s={s} canEdit={canEdit} onEdit={() => setEditingCode(s.code)} />
          ))}
        </div>
      )}

      {editingStage && <EditStageModal stage={editingStage} onClose={() => setEditingCode(null)} />}
      {creating && <NewStageModal projectCode={projectCode} onClose={() => setCreating(false)} />}
    </main>
  );
};
