import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SysButton, SysModal } from '../form';
import { MonoLabel } from '../primitives';
import { SYS } from '../../theme/tokens';
import { formatLong, type DayReport } from '../../mocks/reports';
import { useReports } from '../../state/ReportsContext';
import { useStages } from '../../state/StagesContext';
import { ReportEditorBody } from './ReportEditorBody';
import { ConfirmModal } from '../ConfirmModal';
import { useToasts } from '../../state/ToastContext';

export const EditReportModal = ({ date, report, onClose }: { date: string; report: DayReport; onClose: () => void }) => {
  const { projectCode } = useParams();
  const { saveReport } = useReports();
  const { stages } = useStages();
  const { addToast } = useToasts();
  const [draft, setDraft] = useState<DayReport>(() => ({ ...report }));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    const { error } = await saveReport(date, draft, true);
    setSaving(false);
    if (error) {
      addToast('error', `Не удалось сохранить: ${error}`);
      return;
    }
    addToast('success', 'Отчёт дня обновлён — изменения уже видны клиенту.');
    onClose();
  };

  const deletingTask = draft.tasks.find((t) => t.id === deletingId);

  return (
    <>
      <SysModal width={640} onClose={onClose}>
        <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${SYS.line}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <MonoLabel color={SYS.red}>редактирование · {formatLong(date)}</MonoLabel>
            <h2 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.008em' }}>Отчёт дня</h2>
          </div>
          <span onClick={onClose} style={{ fontSize: 18, color: SYS.muted, cursor: 'pointer' }}>✕</span>
        </div>

        <div style={{ padding: '24px 32px' }}>
          <div style={{ marginTop: -12, marginBottom: 12, fontSize: 11.5, color: SYS.muted, lineHeight: 1.4 }}>
            Изменения обновят уже опубликованный отчёт клиенту.
          </div>
          <ReportEditorBody
            draft={draft}
            setDraft={setDraft}
            allowDeskType
            allowBackOffice
            stages={stages}
            objectCode={projectCode ?? ''}
            onRequestDeleteTask={setDeletingId}
          />
        </div>

        <div style={{ padding: '20px 32px 28px', display: 'flex', gap: 10, borderTop: `1px solid ${SYS.line}` }}>
          <SysButton tone="ghost" full={false} small type="button" onClick={onClose}>Отмена</SysButton>
          <div style={{ flex: 1 }}>
            <SysButton type="button" loading={saving} onClick={save}>Сохранить изменения</SysButton>
          </div>
        </div>
      </SysModal>

      {deletingTask && (
        <ConfirmModal
          title="Удалить задачу?"
          message={`«${deletingTask.title || 'Без названия'}» и все прикреплённые к ней фото будут удалены. Действие необратимо.`}
          onCancel={() => setDeletingId(null)}
          onConfirm={() => {
            setDraft((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== deletingId) }));
            setDeletingId(null);
          }}
        />
      )}
    </>
  );
};
