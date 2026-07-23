import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MonoLabel, Pill } from '../../components/primitives';
import { SysButton } from '../../components/form';
import { ContractStageCard } from '../../components/dashboard/ContractStageCard';
import { EditStageModal } from '../../components/dashboard/EditStageModal';
import { NewStageModal } from '../../components/dashboard/NewStageModal';
import { SYS } from '../../theme/tokens';
import { useAuth } from '../../auth/AuthContext';
import { useStages } from '../../state/StagesContext';
import { PROJECT_INFO } from '../../mocks/project';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { projectCode } = useParams();
  const { stages } = useStages();
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!user || !projectCode) return null;
  const canEdit = user.role === 'admin' || user.role === 'project_manager';
  const info = PROJECT_INFO[projectCode];
  const editingStage = stages.find((s) => s.code === editingCode) ?? null;

  return (
    <main style={{ padding: '36px 56px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <MonoLabel color={SYS.red}>дашборд объекта</MonoLabel>
          <h1 style={{ margin: '10px 0 0', fontSize: 36, fontWeight: 500, letterSpacing: '-0.01em' }}>{info.code}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!canEdit && <Pill tone="ghost">только просмотр</Pill>}
          {canEdit && <SysButton tone="fill" full={false} small type="button" onClick={() => setCreating(true)}>+ Создать подпроект</SysButton>}
        </div>
      </div>
      <div style={{ marginBottom: 28, fontSize: 13, color: SYS.muted }}>{info.address}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {stages.map((s) => (
          <ContractStageCard key={s.code} s={s} canEdit={canEdit} onEdit={() => setEditingCode(s.code)} />
        ))}
      </div>

      {editingStage && <EditStageModal stage={editingStage} onClose={() => setEditingCode(null)} />}
      {creating && <NewStageModal projectCode={projectCode} onClose={() => setCreating(false)} />}
    </main>
  );
};
